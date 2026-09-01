import { GET } from '../route';

const repo = (name: string, language = 'TypeScript') => ({
  id: name,
  name,
  description: name,
  html_url: `https://github.com/example/${name}`,
  homepage: null,
  language,
  stargazers_count: 1,
  forks_count: 1,
  topics: [],
  owner: { login: 'SobralCybersec' },
  updated_at: '2026-01-01T00:00:00Z',
});

const response = (body: unknown, ok = true) => ({
  ok,
  json: async () => body,
  text: async () => String(body),
});

test('enriches manual, video, image, and language fallback repositories', async () => {
  const repos = [
    repo('fiap-project'),
    repo('javadozero'),
    repo('jjkur'),
    repo('video-project'),
    repo('multi-project'),
    repo('single-project'),
    repo('plain-project'),
    repo('bad/name'),
  ];
  const readmes = [
    'React Next.js Vue Angular Node.js Express TypeScript JavaScript Python Django Flask FastAPI Java Spring golang Rust C++ C# MongoDB PostgreSQL MySQL Redis Docker Kubernetes AWS Tailwind GraphQL REST API JWT ![badge](https://img.shields.io/badge/React-yes)',
    '# Java',
    '# JJK',
    '<video src="https://github.com/user-attachments/assets/abc-def"></video>',
    '![one](https://example.test/one.png) ![two](relative.png)',
    '<img src="https://example.test/one.png">',
    'no preview',
  ];
  const fetchMock = jest.fn()
    .mockResolvedValueOnce(response(repos))
    .mockResolvedValueOnce(response([]));
  for (let i = 0; i < repos.length - 1; i += 1) {
    fetchMock.mockResolvedValueOnce(response(readmes[i]));
    fetchMock.mockResolvedValueOnce(response({ TypeScript: 1, JavaScript: 2 }));
  }
  global.fetch = fetchMock;
  const result = await GET({} as any);
  const data = await result.json();
  expect(data).toEqual(expect.arrayContaining([
    expect.objectContaining({ name: 'fiap-project', previewImage: expect.stringContaining('fiap') }),
    expect.objectContaining({ name: 'javadozero', previewImage: 'https://i.imgur.com/oOn2P0s.png' }),
    expect.objectContaining({ name: 'jjkur', previewImage: expect.stringContaining('forgecdn') }),
    expect.objectContaining({ name: 'video-project', isVideo: true }),
    expect.objectContaining({ name: 'multi-project', previewImage: expect.stringContaining('one.png') }),
    expect.objectContaining({ name: 'single-project', previewImage: 'https://example.test/one.png' }),
    expect.objectContaining({ name: 'plain-project', previewImage: expect.stringContaining('/icons/') }),
  ]));
  expect(fetchMock).toHaveBeenCalled();
});

test('handles failed README, language, and top-level requests', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce(response([repo('failed')]))
    .mockResolvedValueOnce(response([]))
    .mockResolvedValueOnce(response('', false))
    .mockResolvedValueOnce(response({}, false));
  const data = await (await GET({} as any)).json();
  expect(data[0].allLanguages).toEqual([]);

  global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
  expect((await GET({} as any)).status).toBe(200);
});

test('extracts small-image skips, HTML videos, and markdown videos', async () => {
  const edge = repo('edge-project');
  global.fetch = jest.fn()
    .mockResolvedValueOnce(response([edge]))
    .mockResolvedValueOnce(response([]))
    .mockResolvedValueOnce(response('demonstration <img width="40" src="https://example.test/tiny.png"><img src="https://example.test/demo.mp4"><video><source data-canonical-src="https://example.test/movie.webm"></video> ![clip](relative.mp4)'))
    .mockResolvedValueOnce(response({ TypeScript: 1 }));
  const data = await (await GET({} as any)).json();
  expect(data[0]).toEqual(expect.objectContaining({ isVideo: true, previewImage: 'https://example.test/movie.webm' }));
});

test('finds HTML Demo attachments and relative Demo Preview videos', async () => {
  const repos = [repo('attachment-demo'), repo('relative-demo')];
  global.fetch = jest.fn()
    .mockResolvedValueOnce(response(repos))
    .mockResolvedValueOnce(response([]))
    .mockResolvedValueOnce(response('<h1>Demo | Command Center</h1>\n\nhttps://github.com/user-attachments/assets/71f1f91c-cf5a-45ad-889d-dd4ab44b73e1'))
    .mockResolvedValueOnce(response({ TypeScript: 1 }))
    .mockResolvedValueOnce(response('## Demo Preview\n[Watch video](assets/demo.webm)'))
    .mockResolvedValueOnce(response({ TypeScript: 1 }));

  const data = await (await GET({} as any)).json();
  expect(data).toEqual(expect.arrayContaining([
    expect.objectContaining({
      name: 'attachment-demo',
      isVideo: true,
      previewImage: 'https://github.com/user-attachments/assets/71f1f91c-cf5a-45ad-889d-dd4ab44b73e1',
    }),
    expect.objectContaining({
      name: 'relative-demo',
      isVideo: true,
      previewImage: 'https://raw.githubusercontent.com/SobralCybersec/relative-demo/main/assets/demo.webm',
    }),
  ]));
});

test('returns unknown error for non-Error top-level failures', async () => {
  global.fetch = jest.fn().mockRejectedValue('offline');
  const result = await GET({} as any);
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual([]);
});

test('returns empty list when one top-level GitHub response is not ok', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce(response({}, false))
    .mockResolvedValueOnce(response([]));
  const result = await GET({} as any);
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual([]);
});

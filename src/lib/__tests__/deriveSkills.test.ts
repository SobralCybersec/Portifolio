import { deriveSkills } from '../deriveSkills';

test('derives GitHub languages and topics into capability buckets', () => {
  const skills = deriveSkills([
    {
      language: 'TypeScript',
      topics: ['spring-boot', 'docker'],
      allLanguages: ['Rust'],
      techStack: ['PostgreSQL'],
    },
  ]);

  expect(skills.frontend).toContain('TypeScript');
  expect(skills.systems).toContain('Rust');
  expect(skills.backend).toContain('Spring');
  expect(skills.devops).toContain('Docker');
});

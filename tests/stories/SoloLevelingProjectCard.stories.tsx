import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SoloLevelingProjectCard from '../../src/components/projects/SoloLevelingProjectCard';

const meta = {
  title: 'Projects/SoloLevelingProjectCard',
  component: SoloLevelingProjectCard,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SoloLevelingProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseRepo = {
  id: 101,
  name: 'qa-showcase',
  description: 'Stable repository fixture for browser QA.',
  html_url: 'https://github.com/example/qa-showcase',
  homepage: 'https://example.com/qa-showcase',
  language: 'TypeScript',
  stargazers_count: 12,
  forks_count: 3,
  topics: ['react', 'testing'],
  previewImage: '/icons/typescript.png',
};

export const Default: Story = {
  args: {
    repo: baseRepo,
    index: 0,
    onReadme: () => undefined,
  },
};

export const Featured: Story = {
  args: {
    repo: baseRepo,
    index: 0,
    featured: true,
    onReadme: () => undefined,
  },
};

export const LongTitle: Story = {
  args: {
    repo: {
      ...baseRepo,
      name: 'an-intentionally-long-project-title-for-truncation-checks',
      description: null,
    },
    index: 1,
    onReadme: () => undefined,
  },
};

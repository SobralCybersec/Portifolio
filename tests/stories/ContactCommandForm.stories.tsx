import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Github, Linkedin } from 'lucide-react';
import ContactCommandForm from '../../src/components/contact/ContactCommandForm';

const meta = {
  title: 'Contact/ContactCommandForm',
  component: ContactCommandForm,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ContactCommandForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  title: 'Get in touch',
  description: 'Full-stack development and cybersecurity projects.',
  emailAddress: 'hello@example.test',
  emailLabel: 'Email',
  links: [
    { label: 'GitHub', href: 'https://github.com/example', icon: Github },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/example', icon: Linkedin },
  ],
  copy: {
    transmission: 'TRANSMISSION / 01',
    identity: 'IDENTITY',
    namePlaceholder: 'Your name',
    projectBrief: 'PROJECT BRIEF',
    projectBriefPlaceholder: 'What are you building?',
    validationError: 'Complete name, valid email, and project brief.',
    draftReady: 'Mail draft ready.',
    openMailChannel: 'OPEN MAIL CHANNEL',
    draftReadyButton: 'DRAFT READY',
    directChannel: 'DIRECT CHANNEL',
    responseWindow: 'RESPONSE WINDOW',
    opportunities: 'Available for software development and cybersecurity internships.',
  },
};

export const Default: Story = { args: baseArgs };

export const LongBrief: Story = {
  args: {
    ...baseArgs,
    description: 'A longer description keeps the form readable while preserving the current responsive grid and real field behavior.',
  },
};

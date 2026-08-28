import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AboutScrollStory from '../about/AboutScrollStory';
import CapabilityRail from '../CapabilityRail';
import ContactCommandForm from '../contact/ContactCommandForm';
import MagneticButton from '../MagneticButton';
import ScrollReveal from '../ScrollReveal';
import ScrollVelocityRibbon from '../ScrollVelocityRibbon';
import InteractiveExpertiseGrid from '../about/InteractiveExpertiseGrid';

const capabilityItems = [
  {
    id: 'frontend',
    label: 'Frontend systems',
    eyebrow: 'Capability 01',
    items: ['React', 'Next.js', 'TypeScript'],
    image: '/icons/typescript.png',
  },
];

test('SOURCE-derived capability rail expands from keyboard and pointer input', () => {
  render(<CapabilityRail items={capabilityItems} />);

  const control = screen.getByRole('button', { name: /Frontend systems/i });
  expect(control).toHaveAttribute('aria-expanded', 'false');

  fireEvent.focus(control);
  expect(control).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Capability 01')).toBeInTheDocument();

  fireEvent.click(control);
  expect(control).toHaveAttribute('aria-expanded', 'false');

  fireEvent.mouseEnter(control);
  expect(control).toHaveAttribute('aria-expanded', 'true');
  fireEvent.mouseLeave(control.parentElement!);
  expect(control).toHaveAttribute('aria-expanded', 'false');
});

test('magnetic CTA keeps internal and external navigation semantic', () => {
  const { rerender } = render(<MagneticButton href="/projects">Explore work</MagneticButton>);
  expect(screen.getByRole('link', { name: 'Explore work' })).toHaveAttribute('href', '/projects');

  rerender(<MagneticButton href="mailto:hello@example.test" variant="outline">Send a note</MagneticButton>);
  const externalLink = screen.getByRole('link', { name: 'Send a note' });
  expect(externalLink).toHaveAttribute('href', 'mailto:hello@example.test');
  fireEvent.pointerEnter(externalLink.firstElementChild!);
  fireEvent.pointerLeave(externalLink.firstElementChild!);
});

test('word reveal and scroll ribbon render their repeated motion content', () => {
  const { container } = render(
    <>
      <ScrollReveal>Build useful interfaces</ScrollReveal>
      <ScrollVelocityRibbon>Scroll cue</ScrollVelocityRibbon>
    </>,
  );

  expect(container.querySelectorAll('.inline-block')).toHaveLength(3);
  expect(screen.getAllByText('Scroll cue')).toHaveLength(6);
});

test('about story and expertise modules expose source-derived interaction surfaces', () => {
  render(
    <>
      <AboutScrollStory
        items={[{ label: '01 / STORY', title: 'Background', body: 'System story', signal: 'SIGNAL', detail: 'Detail' }]}
        sectionLabel="FIELD NOTES"
        prompt="Scroll"
      />
      <InteractiveExpertiseGrid groups={[{ title: 'Security', items: ['Rust', 'OWASP'] }]} />
    </>,
  );

  expect(screen.getByRole('region', { name: 'FIELD NOTES' })).toBeInTheDocument();
  const card = screen.getByText('Security').closest('article')!;
  fireEvent.pointerMove(card, { clientX: 40, clientY: 20, pointerType: 'mouse' });
  fireEvent.pointerLeave(card);
  expect(screen.getByText('OWASP')).toBeInTheDocument();
});

test('contact command form validates fields before opening a mail draft', () => {
  render(
    <ContactCommandForm
      title="Get in touch"
      description="Build something useful."
      emailAddress="hello@example.test"
      emailLabel="Email"
      links={[]}
    />,
  );

  fireEvent.submit(screen.getByRole('button', { name: /OPEN MAIL CHANNEL/i }).closest('form')!);
  expect(screen.getByText(/Complete name, valid email/i)).toBeInTheDocument();
});

import { fireEvent, render, screen } from '@testing-library/react';
import InteractiveExpertiseGrid from '../about/InteractiveExpertiseGrid';

test('emits selected skill from an expertise pill', () => {
  const onSkillSelect = jest.fn();

  render(
    <InteractiveExpertiseGrid
      groups={[{ title: 'Backend', items: ['Spring Boot', 'PostgreSQL'] }]}
      selectedSkill="Spring Boot"
      onSkillSelect={onSkillSelect}
    />,
  );

  const skill = screen.getByRole('button', { name: 'Spring Boot' });
  expect(skill).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(skill);
  expect(onSkillSelect).toHaveBeenCalledWith('Spring Boot');
});

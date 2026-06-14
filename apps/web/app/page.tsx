import { redirect } from 'next/navigation';

/**
 * Root page — redirects to the projects dashboard.
 */
export default function HomePage() {
  redirect('/projects');
}

// tests/pages/AboutPage.test.tsx
import { render, screen } from '@testing-library/react'
import AboutPage from '../../app/about/page'
describe('AboutPage', () => {
  it('renders main heading and description', () => {
    render(<AboutPage />)

    // cek judul utama
    const heading = screen.getByRole('heading', { name: /about gorillatix/i })
    expect(heading).toBeInTheDocument()

    // cek paragraf deskripsi
    const description = screen.getByText(/Your trusted platform for discovering and booking tickets/i)
    expect(description).toBeInTheDocument()
  })

  it('renders Our Story section', () => {
    render(<AboutPage />)

    // cek heading Our Story
    expect(screen.getByRole('heading', { name: /our story/i })).toBeInTheDocument()

    // cek sebagian teks Our Story
    expect(screen.getByText(/Founded in 2025, GorillaTix was born from a simple idea/i)).toBeInTheDocument()
  })

  it('renders Our Mission section', () => {
    render(<AboutPage />)

    expect(screen.getByRole('heading', { name: /our mission/i })).toBeInTheDocument()
    expect(
      screen.getByText(/connect people with unforgettable experiences through a seamless ticketing platform/i)
    ).toBeInTheDocument()
  })

  it('renders the three cards with Simplicity, Security and Diversity', () => {
    render(<AboutPage />)

    expect(screen.getByRole('heading', { name: /simplicity/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /security/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /diversity/i })).toBeInTheDocument()
  })

  it('renders Contact Us button linking to /contact', () => {
    render(<AboutPage />)

    const contactButton = screen.getByRole('link', { name: /contact us/i })
    expect(contactButton).toBeInTheDocument()
    expect(contactButton).toHaveAttribute('href', '/contact')
  })
})

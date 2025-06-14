import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/search-form";
import Image from "next/image";
import Head from "next/head";

export function HeroSection() {
  return (
    <>
      <Head>
        <link
          rel="preload"
          as="image"
          href="/_next/image?url=%2Fimages%2Fhero_logo_gtix.webp&w=1200&q=75"
        />
      </Head>
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Find and Book Your Next Event
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Discover concerts, sports, theater, and more. Secure your
                  tickets with GorillaTix.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <div className="relative flex-1">
                  <SearchForm />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events?category=music">Concerts</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events?category=sports">Sports</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events?category=theater">Theater</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events?category=comedy">Comedy</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative aspect-video overflow-hidden rounded-xl w-full h-full">
                <Image
                  src="/images/hero_logo_gtix.webp"
                  alt="Featured events"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover w-full h-full rounded-xl"
                  priority
                  placeholder="blur"
                  blurDataURL="/images/hero_logo_gtix_placeholder.webp" // bikin versi 10px-an
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

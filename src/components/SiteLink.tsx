import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * Site-wide <Link>.
 *
 * This site is a static export, so the RSC segment payloads Next requests when it
 * prefetches a route are not part of the build: every prefetch of a page payload
 * 404s (`__next.$d$category.__PAGE__.txt`, `__next.about.__PAGE__.txt`). The
 * prefetch therefore costs a failed request per visible link and gains nothing,
 * so it defaults to off. Pass `prefetch` explicitly to opt back in.
 */
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

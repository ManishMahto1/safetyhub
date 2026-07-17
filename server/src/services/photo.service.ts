import axios from 'axios';
import { cacheService } from './cache.service';

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php';

/**
 * Attempts to resolve a real photo for a place from its OSM tags:
 * 1. A direct `image` tag (URL).
 * 2. A `wikimedia_commons` tag (file name), resolved via the Commons API.
 * Returns null on any miss or failure — callers fall back to a category
 * icon (see client PlacePhoto.jsx), so this never throws.
 */
export async function lookupPhoto(tags: Record<string, string>): Promise<string | null> {
  if (tags.image && /^https?:\/\//.test(tags.image)) {
    return tags.image;
  }

  const commonsFile = tags.wikimedia_commons;
  if (!commonsFile) return null;

  const cacheKey = `photo:${commonsFile}`;
  try {
    return await cacheService.wrap(cacheKey, 24 * 60 * 60 * 1000, async () => {
      const { data } = await axios.get(WIKIMEDIA_API, {
        params: {
          action: 'query',
          titles: commonsFile,
          prop: 'imageinfo',
          iiprop: 'url',
          iiurlwidth: 480,
          format: 'json',
        },
        timeout: 8000,
      });

      const pages = data?.query?.pages || {};
      const page = Object.values(pages)[0] as
        | { imageinfo?: Array<{ thumburl?: string; url?: string }> }
        | undefined;

      return page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url || null;
    });
  } catch {
    return null;
  }
}

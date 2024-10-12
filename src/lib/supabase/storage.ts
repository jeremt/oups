import {SUPABASE_URL} from '$env/static/private';

/**
 * Create the public download url of a file from a supabase bucket.
 * A random key is added to refresh the cash.
 * @param fullPath The url of the file returned after upload (data.fullPath).
 * @param cacheKey The cacheKey to use (if any) to bust or not the Supabase Storage cache.
 * @returns
 */
export function getDownloadUrl(fullPath: string, cacheKey: string | number | undefined = Math.round(Math.random() * 1e4)) {
    return `${SUPABASE_URL}/storage/v1/object/public/${fullPath}${cacheKey === undefined ? '' : `?k=${cacheKey}`}`;
}

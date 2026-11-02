/**
 * Single source of truth for every size limit that crosses a trust boundary.
 *
 * WHY: schemas without bounds validate happily while a client sends 1,000,000
 * stack frames or a 50 MB `extra` blob. Validation is the FIRST line of defence
 * for memory/CPU, so every string, array and record in a public contract is
 * bounded here. The SDK can import the same constants to truncate client-side
 * (so honest clients never hit a rejection), and the HTTP layer uses
 * MAX_EVENT_BYTES for the body-size cap. One number, three consumers.
 */
import { z } from 'zod';

export const LIMITS = {
  // transport max http event body
  MAX_EVENT_BYTES: 256 * 1024,

  // collections  number of elements
  MAX_FRAMES: 200,
  MAX_BREADCRUMBS: 100,
  MAX_TAGS: 50,
  MAX_HEADERS: 100,
  MAX_CONTEXT_LINES: 10,
  PAGE_MAX: 100,
  BULK_MAX: 100,

  // strings max individual string length
  EXCEPTION_TYPE: 256,
  EXCEPTION_VALUE: 8192,
  FILENAME: 1024,
  FUNCTION_NAME: 512,
  SOURCE_LINE: 1000,
  TAG_KEY: 100,
  TAG_VALUE: 500,
  HEADER_VALUE: 2000,
  RELEASE: 200,
  ENVIRONMENT: 64,
  NAME: 100,
  QUERY: 100,
  URL: 2048,
  CURSOR: 512,

  // free-form JSON blobs (serialized size of an object)
  EXTRA_BYTES: 16 * 1024,
  BREADCRUMB_DATA_BYTES: 4 * 1024,

  // JSON Complexity
  MAX_JSON_DEPTH: 20,
  MAX_JSON_NODES: 10_000,
} as const;   // typescript infers just readonly 

// REuse one encoder instead of allocating per call
const encoder = new TextEncoder();


/** UTF-8 size of a value once serialized as JSON. Never throws. */
// new Textencoder.encode take string convert it into utf8 bytes 
// .length gives us the length of bytes.
// if value to large catch fail-closed approach 
// return infinity that size validator reject this value.

export function jsonByteSize(value: unknown): number {
  try {
    const serialized = JSON.stringify(value);
    
    if(typeof serialized !== "string"){
        return Number.POSITIVE_INFINITY;
    }

    return encoder.encode(serialized).byteLength;
  } catch {
    return Number.POSITIVE_INFINITY; // unserializable (e.g. circular) => reject
  }
}


/**
 * Check whether a value consists exclusively of JSON-compatible
 * data, without excessive nesting or excessive node counts.
 *
 * Only plain objects and arrays are accepted.
 * Cycles, BigInt, undefined, functions and symbols are rejected.
 */
function isSafeJson(
  root: unknown,
  maxDepth: number,
  maxNodes: number,
): boolean {
  const stack: Array<{
    value: unknown;
    depth: number;
    exit?: boolean;
  }> = [{ value: root, depth: 0 }];

  const active = new WeakSet<object>();
  let nodes = 0;

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current.exit) {
      active.delete(current.value as object);
      continue;
    }

    nodes++;

    if (nodes > maxNodes || current.depth > maxDepth) {
      return false;
    }

    const value = current.value;

    // Valid JSON primitives
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "boolean"
    ) {
      continue;
    }

    if (typeof value === "number") {
      if (!Number.isFinite(value)) return false;
      continue;
    }

    // Reject undefined, functions, symbols, bigint, etc.
    if (typeof value !== "object") {
      return false;
    }

    // Detect circular references.
    if (active.has(value)) {
      return false;
    }

    // Only arrays and plain objects are supported.
    if (
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null
    ) {
      return false;
    }

    active.add(value);

    stack.push({
      value,
      depth: current.depth,
      exit: true,
    });

    const children = Array.isArray(value)
      ? value
      : Object.values(value);

    for (const child of children) {
      stack.push({
        value: child,
        depth: current.depth + 1,
      });
    }
  }

  return true;
}



/** Free-form JSON object whose serialized size is capped. */
// boundedJsonRecord is a function that takes a maxBytes parameter and returns a Zod schema for a record (object) with unknown values. 
// The schema includes a refinement that checks if the serialized size of the object is less than or equal to maxBytes. 
// If the size exceeds maxBytes, it will return an error message indicating that the object must be at most maxBytes bytes when serialized.
// z.record() => validate an object with key-value entries
// z.unknown() => allows arbitrary values inside the record.
// .refine() add a custom validation condition.  jo hum na banai us validation ko apply kar sakty ha
// 
export const boundedJsonRecord = (maxBytes: number) => {
    if(!Number.isSafeInteger(maxbytes) || maxBytes < 0){
        throw new RangeError("maxBytes must be a non-negative safe integer");
    }

    return z.record(z.string(), z.unknown()).refine((value) => isSafeJson(
        value,
        LIMITS.MAX_JSON_DEPTH,
        LIMITS.MAX_JSON_NODES,
    )
    &&
    jsonByteSize(value) <= maxBytes,
    {
        message: `Must be valid JSON within ${maxBytes} bytes and the configured complexity limits`,
    },
);
};
  

/** String->string map with caps on key count, key length and value length. */
// this is specifically for string-to-string object
// { environment: "production",  browser: "Chrome",  platform: "Windows"} valid..
// { environment : 123 }  invalid. must be string

export const boundedStringMap = (maxKeys: number, maxKeyLen: number, maxValueLen: number) => {
    const limits = [maxKeys, maxKeyLen, maxValueLen];

    if(limits.some((limit) => !Number.isSafeInteger(limit) || limit < 0,
)
){
    throw new RangeError("Map limits must be non-negative safe integers");
}

return z.record(
    z.string().max(maxKeyLen),
    z.string().max(maxValueLen),
)
.refine(
    (record) => Object.keys(record).length <= maxKeys,
    {
        message: `Must contain at most ${maxKeys} entries`,
    },
);

};
  

/** Environment names are used in cache keys and queries: keep them boring. */
// allowed  production / development / staging / production-eu / test_01
// "production environment" invalidd
// "production/../../admin " invalidd
export const EnvironmentSchema = z
  .string()
  .min(1, "Environment cannot be empty")
  .max(LIMITS.ENVIRONMENT)
  .regex(/^[a-zA-Z0-9_.-]+$/, 'environment may only contain letters, digits, _ . -');

  // environment values appears in database filter, cache keys, logs, monitoring dashboards.
import https from "https";

export type DomainrSearchParams = {
  query: string;
  defaults?: string[];
  registrar?: string;
  location?: string;
};

export type DomainrResult = {
  domain: string;
  status: string | string[];
  summary?: string;
  registerURL?: string;
};

export type DomainrSearchResponse = {
  results: DomainrResult[];
  query: string;
};

const DOMAINR_HOST = "domainr.p.rapidapi.com";

export function domainrSearch({
  query,
  defaults = [],
  registrar = "dnsimple.com",
  location = "us",
}: DomainrSearchParams): Promise<DomainrSearchResponse> {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY is not set");
  }

  const searchParams = new URLSearchParams({
    query,
    registrar,
    location,
  });

  if (defaults.length > 0) {
    searchParams.set("defaults", defaults.join(","));
  }

  const options: https.RequestOptions = {
    method: "GET",
    hostname: DOMAINR_HOST,
    path: `/v2/search?${searchParams.toString()}`,
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": DOMAINR_HOST,
    },
  };

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      const chunks: Buffer[] = [];

      response.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      response.on("end", () => {
        try {
          const body = Buffer.concat(chunks).toString();
          const parsed = JSON.parse(body) as {
            results?: Array<{
              domain: string;
              status: string | string[];
              summary?: string;
              registerURL?: string;
            }>;
            query?: { domain?: string };
          };

          resolve({
            results:
              parsed.results?.map((result) => ({
                domain: result.domain,
                status: result.status,
                summary: result.summary,
                registerURL: result.registerURL,
              })) ?? [],
            query,
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.end();
  });
}


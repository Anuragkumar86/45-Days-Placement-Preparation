export class UrlRepository {
  private map: Map<string, string>;

  constructor() {
    this.map = new Map<string, string>();
  }

  public save(shortCode: string, longUrl: string): void {
    if (this.map.has(shortCode)) {
      throw new Error(`Duplicate key error: ${shortCode} already exists.`);
    }
    this.map.set(shortCode, longUrl);
  }

  public check(shortCode: string): boolean {
    return this.map.has(shortCode);
  }

  public getLongUrl(shortCode: string): string | null {
    return this.map.get(shortCode) ?? null;
  }
}

export class CodeGenerator {
  private static readonly CHARACTERS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  public generateShortUrl(length: number = 6): string {
    let result = "";
    const charLength = CodeGenerator.CHARACTERS.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charLength);
      result += CodeGenerator.CHARACTERS.charAt(randomIndex);
    }

    return result;
  }
}

export class UrlShortenerService {
  private repo: UrlRepository;
  private generator: CodeGenerator;

  constructor(repo: UrlRepository, generator: CodeGenerator) {
    this.repo = repo;
    this.generator = generator;
  }

  public shortenUrl(longUrl: string, codeLength: number = 6): string {
    let shortCode = this.generator.generateShortUrl(codeLength);
    let retries = 0;
    const MAX_RETRIES = 10;

    // Correct Collision Handling: Regenerate candidate code
    while (this.repo.check(shortCode)) {
      shortCode = this.generator.generateShortUrl(codeLength);
      retries++;
      if (retries >= MAX_RETRIES) {
        throw new Error("System high load: Failed to generate a unique short code.");
      }
    }

    this.repo.save(shortCode, longUrl);
    return shortCode;
  }

  public getLongUrl(shortCode: string): string {
    const longUrl = this.repo.getLongUrl(shortCode);
    if (!longUrl) {
      throw new Error(`URL for short code '${shortCode}' was not found.`);
    }
    return longUrl;
  }
}

const repo = new UrlRepository();
const generator = new CodeGenerator();
const service = new UrlShortenerService(repo, generator);

const short = service.shortenUrl("https://example.com/some/long/linkgrnjgrgururh");
console.log("Short url is: ", short);
console.log("---------------------------------------------")
const long_Org = service.getLongUrl(short)
console.log("Long Original url is: ", long_Org);
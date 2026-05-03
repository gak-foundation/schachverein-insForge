import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "./sanitize-html";

describe("sanitizeHtml", () => {
  it("sollte einfachen Text passieren lassen", () => {
    expect(sanitizeHtml("Hallo Welt")).toBe("Hallo Welt");
  });

  it("sollte leeren String zurückgeben", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("sollte erlaubte Tags ohne Attribute behalten", () => {
    const input = "<p>Hallo</p><strong>Welt</strong>";
    expect(sanitizeHtml(input)).toBe("<p>Hallo</p><strong>Welt</strong>");
  });

  it("sollte script-Tags entfernen", () => {
    const input = '<p>Text</p><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain("script");
    expect(result).not.toContain("alert");
    expect(result).toContain("<p>Text</p>");
  });

  it("sollte style-Tags entfernen", () => {
    const input = '<p>Text</p><style>body{color:red}</style>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain("style");
    expect(result).toContain("<p>Text</p>");
  });

  it("sollte nicht erlaubte Tags entfernen", () => {
    const input = "<p>Gut</p><marquee>Böse</marquee><img src='x' />";
    const result = sanitizeHtml(input);
    expect(result).toContain("<p>Gut</p>");
    expect(result).not.toContain("marquee");
    expect(result).not.toContain("img");
  });

  it("sollte href-Urls mit :// im Attribut nicht parsen", () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toBe('Link</a>');
  });

  it("sollte class-Attribute in span erlauben", () => {
    const input = '<span class="highlight">Text</span>';
    expect(sanitizeHtml(input)).toBe('<span class="highlight">Text</span>');
  });

  it("sollte nicht erlaubte Attribute entfernen", () => {
    const input = '<p onclick="alert(1)" style="color:red">Text</p>';
    const result = sanitizeHtml(input);
    expect(result).toBe("<p>Text</p>");
  });

  it("sollte verschachtelte erlaubte Tags behalten", () => {
    const input = "<ul><li><strong>Wichtig:</strong> Punkt 1</li><li>Punkt 2</li></ul>";
    const result = sanitizeHtml(input);
    expect(result).toContain("<ul>");
    expect(result).toContain("<li>");
    expect(result).toContain("<strong>");
  });

  it("sollte Tabellen-Tags erlauben", () => {
    const input = "<table><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Max</td></tr></tbody></table>";
    const result = sanitizeHtml(input);
    expect(result).toContain("<table>");
    expect(result).toContain("<td>Max</td>");
  });

  it("sollte mehrere script-Blockaden verarbeiten", () => {
    const input = '<p>a</p><script>bad()</script><p>b</p><script>more()</script><p>c</p>';
    const result = sanitizeHtml(input);
    expect(result).toBe("<p>a</p><p>b</p><p>c</p>");
  });
});

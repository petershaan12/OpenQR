export const validateSocialLink = (platform: string, url: string): boolean => {
  if (!url) return true;

  const lowerUrl = url.toLowerCase();

  switch (platform) {
    case "Instagram":
      return /^(https?:\/\/)?(www\.)?instagram\.com\//.test(lowerUrl);
    case "Facebook":
      return /^(https?:\/\/)?(www\.)?facebook\.com\//.test(lowerUrl);
    case "Twitter":
      return /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\//.test(lowerUrl);
    case "LinkedIn":
      return /^(https?:\/\/)?(www\.)?linkedin\.com\//.test(lowerUrl);
    case "YouTube":
      return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(lowerUrl);
    case "TikTok":
      return /^(https?:\/\/)?(www\.)?tiktok\.com\//.test(lowerUrl);
    case "Pinterest":
      return /^(https?:\/\/)?(www\.)?pinterest\.com\//.test(lowerUrl);
    case "WhatsApp":
      return /^(https?:\/\/)?(www\.)?(wa\.me|whatsapp\.com)\//.test(lowerUrl);
    case "Website":
      return (
        lowerUrl.startsWith("http://") ||
        lowerUrl.startsWith("https://") ||
        lowerUrl.includes(".")
      );
    default:
      return true;
  }
};

export const getPlatformPlaceholder = (platform: string): string => {
  switch (platform) {
    case "Instagram":
      return "https://instagram.com/username";
    case "Facebook":
      return "https://facebook.com/username";
    case "Twitter":
      return "https://twitter.com/username";
    case "LinkedIn":
      return "https://linkedin.com/in/username";
    case "YouTube":
      return "https://youtube.com/@channel";
    case "TikTok":
      return "https://tiktok.com/@username";
    case "Pinterest":
      return "https://pinterest.com/username";
    case "WhatsApp":
      return "https://wa.me/number";
    case "Website":
      return "https://yourwebsite.com";
    default:
      return "Enter your link here";
  }
};

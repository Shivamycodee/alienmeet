

export function compareStrings(a: string, b: string): string {
    const getLeadingNumber = (str: string): string | null => {
      const match = str.match(/^\d+/);
      return match ? match[0] : null;
    };
  
    const aNum = getLeadingNumber(a);
    const bNum = getLeadingNumber(b);
  
    // If both start with numbers
    if (aNum && bNum) {
      return aNum.length <= bNum.length ? a : b;
    }
  
    // If only one starts with a number
    if (aNum && !bNum) return a;
    if (!aNum && bNum) return b;
  
    // If both are letters, compare alphabetically
    return a.localeCompare(b) <= 0 ? a : b;
  }
  
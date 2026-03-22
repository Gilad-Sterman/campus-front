// Utility functions for handling smooth scrolling

/**
 * Scrolls smoothly to an element with the specified ID
 * @param {string} id - The ID of the element to scroll to
 * @param {number} offset - Optional offset from the top (useful for fixed headers)
 */
export const scrollToElement = (id, offset = 0) => {
  const element = document.getElementById(id);
  
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

/**
 * Custom hook to handle anchor links with smooth scrolling
 * @param {number} headerOffset - Offset for fixed header
 */
export const useAnchorLinkHandler = (headerOffset = 80) => {
  return (e, to) => {
    // Only handle anchor links
    if (to && to.startsWith('/#')) {
      e.preventDefault();
      const id = to.substring(2); // Remove the '/#' part
      scrollToElement(id, headerOffset);
    }
  };
};

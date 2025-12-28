import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes all HTML tags except basic formatting
 */
export const sanitizeContent = (content: string): string => {
    if (!content) return '';

    return sanitizeHtml(content, {
        allowedTags: [], // No HTML tags allowed
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
    });
};

/**
 * Sanitize content but allow basic formatting
 * For rich text fields like announcements
 */
export const sanitizeRichContent = (content: string): string => {
    if (!content) return '';

    return sanitizeHtml(content, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
    });
};

/**
 * Sanitize an object's string properties recursively
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
    const sanitized = { ...obj };

    for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitizeContent(sanitized[key]) as any;
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
    }

    return sanitized;
};

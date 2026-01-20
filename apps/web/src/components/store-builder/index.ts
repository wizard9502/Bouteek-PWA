// Store Builder Components Index
// Import this file to register all components

// Sections (auto-register with ComponentRegistry)
import './sections';

// Core components
export { SchemaRenderer, createSection, reorderSections, removeSection, updateSectionConfig } from './SchemaRenderer';
export { UniversalVideo, isValidVideoUrl, getVideoThumbnail } from './UniversalVideo';
export { SocialFooter } from './SocialFooter';

// Re-export all sections
export * from './sections';

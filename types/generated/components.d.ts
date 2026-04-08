import type { Schema, Struct } from '@strapi/strapi';

export interface SharedProjectFeature extends Struct.ComponentSchema {
  collectionName: 'components_shared_project_features';
  info: {
    displayName: 'Project Feature';
    icon: 'bulletList';
  };
  attributes: {};
}

export interface SharedTechStackItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_tech_stack_items';
  info: {
    displayName: 'Tech Stack Item';
    icon: 'stack';
  };
  attributes: {};
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.project-feature': SharedProjectFeature;
      'shared.tech-stack-item': SharedTechStackItem;
    }
  }
}

import type { Schema, Struct } from '@strapi/strapi';

export interface SharedCourseworkGroup extends Struct.ComponentSchema {
  collectionName: 'components_shared_coursework_groups';
  info: {
    displayName: 'Coursework Group';
    icon: 'book';
  };
  attributes: {
    courses: Schema.Attribute.JSON;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedProjectFeature extends Struct.ComponentSchema {
  collectionName: 'components_shared_project_features';
  info: {
    displayName: 'Project Feature';
    icon: 'bulletList';
  };
  attributes: {};
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    displayName: 'Social Link';
    icon: 'link';
  };
  attributes: {
    icon: Schema.Attribute.Enumeration<
      ['github', 'linkedin', 'twitter', 'website', 'email']
    > &
      Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
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
      'shared.coursework-group': SharedCourseworkGroup;
      'shared.project-feature': SharedProjectFeature;
      'shared.social-link': SharedSocialLink;
      'shared.tech-stack-item': SharedTechStackItem;
    }
  }
}

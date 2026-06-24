export interface LessonFrontmatter {
  title: string;
  description: string;
  module: string;
  order: number;
  duration: string;
  personas: string[];
  tags: string[];
}

export interface ModuleDefinition {
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonDefinition[];
}

export interface LessonDefinition {
  slug: string;
  title: string;
  description: string;
  order: number;
  duration: string;
  personas: string[];
}

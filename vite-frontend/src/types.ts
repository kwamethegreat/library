export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type CourseCategory =
  | 'Networking'
  | 'Cybersecurity'
  | 'Cloud'
  | 'Automation'
  | 'Linux'
  | 'Career';

export interface Course {
  id: number;
  title: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: string;
  lessons: number;
  rating: number;
  students: string;
  imageGradient: string;
  outcomes: string[];
  description: string;
  featured?: boolean;
}

import { useMemo, useState } from 'react';
import { categories, courses } from './data/courses';
import type { Course, CourseCategory } from './types';

type SelectedCategory = 'All' | CourseCategory;

function App() {
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesCategory =
        selectedCategory === 'All' || course.category === selectedCategory;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          course.title,
          course.category,
          course.level,
          course.description,
          ...course.outcomes,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  const featuredCourses = courses.filter((course) => course.featured);

  return (
    <main className="page-shell">
      <Navigation />

      <section className="hero-section" id="home">
        <div className="hero-copy">
          <p className="eyebrow">Practical IT learning library</p>
          <h1>Build job-ready IT skills with structured, hands-on courses.</h1>
          <p className="hero-description">
            Learn networking, cybersecurity, cloud, Linux, and automation through
            practical lessons designed for real infrastructure work.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#library">
              Browse courses
            </a>
            <a className="secondary-button" href="#paths">
              View learning paths
            </a>
          </div>
        </div>

        <div className="hero-panel" aria-label="Course library highlights">
          <div className="floating-badge">New labs weekly</div>
          <h2>Library snapshot</h2>
          <div className="hero-stats-grid">
            <StatCard value="80+" label="hands-on labs" />
            <StatCard value="6" label="skill tracks" />
            <StatCard value="4.8" label="avg. rating" />
            <StatCard value="70k+" label="learners" />
          </div>
        </div>
      </section>

      <section className="section-block" id="featured">
        <div className="section-heading">
          <p className="eyebrow">Featured</p>
          <h2>Start with high-impact courses</h2>
          <p>
            These courses are designed to create fast momentum in the skills
            most IT teams use every week.
          </p>
        </div>

        <div className="featured-grid">
          {featuredCourses.map((course) => (
            <CourseCard course={course} key={course.id} compact />
          ))}
        </div>
      </section>

      <section className="section-block library-section" id="library">
        <div className="section-heading library-heading">
          <div>
            <p className="eyebrow">Course library</p>
            <h2>Find your next course</h2>
          </div>
          <label className="search-label">
            <span className="sr-only">Search courses</span>
            <input
              type="search"
              placeholder="Search networking, cloud, firewall, Python..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>

        <div className="category-tabs" aria-label="Course categories">
          {categories.map((category) => (
            <button
              className={category === selectedCategory ? 'active' : ''}
              key={category}
              onClick={() => setSelectedCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="course-grid">
          {filteredCourses.map((course) => (
            <CourseCard course={course} key={course.id} />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="empty-state">
            <h3>No courses found</h3>
            <p>Try a different search term or choose another category.</p>
          </div>
        )}
      </section>

      <section className="section-block paths-section" id="paths">
        <div className="section-heading">
          <p className="eyebrow">Learning paths</p>
          <h2>Follow a clear path from beginner to production-ready</h2>
        </div>

        <div className="path-grid">
          <LearningPath
            step="01"
            title="IT Foundations"
            text="Start with networking, Linux, troubleshooting, and core infrastructure concepts."
          />
          <LearningPath
            step="02"
            title="Security Operations"
            text="Move into firewalls, VPNs, identity, posture, logs, and incident workflows."
          />
          <LearningPath
            step="03"
            title="Automation and Cloud"
            text="Use Python, APIs, cloud services, and reusable scripts to scale your work."
          />
        </div>
      </section>

      <section className="cta-section">
        <div>
          <p className="eyebrow">Ready to learn smarter?</p>
          <h2>Join the library and build practical IT skills every week.</h2>
        </div>
        <a className="primary-button" href="mailto:hello@example.com">
          Request access
        </a>
      </section>
    </main>
  );
}

function Navigation() {
  return (
    <header className="site-header">
      <a className="logo" href="#home" aria-label="IT Course Library home">
        <span>IT</span> Course Library
      </a>
      <nav aria-label="Primary navigation">
        <a href="#featured">Featured</a>
        <a href="#library">Courses</a>
        <a href="#paths">Paths</a>
      </nav>
    </header>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function CourseCard({ course, compact = false }: { course: Course; compact?: boolean }) {
  return (
    <article className={`course-card ${compact ? 'compact-card' : ''}`}>
      <div className="course-art" style={{ background: course.imageGradient }}>
        <span>{course.category}</span>
      </div>
      <div className="course-content">
        <div className="course-meta">
          <span>{course.level}</span>
          <span>{course.duration}</span>
          <span>{course.lessons} lessons</span>
        </div>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <ul className="outcome-list">
          {course.outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
        <div className="course-footer">
          <span aria-label={`Rating ${course.rating} out of 5`}>★ {course.rating}</span>
          <span>{course.students} students</span>
        </div>
      </div>
    </article>
  );
}

function LearningPath({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <article className="path-card">
      <span>{step}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export default App;

// Job source registry for JobForge scanner
// Each source: { id, name, baseUrl, searchUrl, parser }

export const SOURCES = {
  indeed: {
    id: 'indeed',
    name: 'Indeed Germany',
    baseUrl: 'https://de.indeed.com',
    searchUrl: (query, location = 'Germany') => 
      `https://de.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`,
    // SimpleIndeed parsing - returns job cards
    selector: '.job-card',
    fields: {
      id: 'data-jobid',
      title: '.jobTitle > span',
      company: '.companyName',
      location: '.companyLocation',
      link: '.jobTitle a'
    }
  },
  stepstone: {
    id: 'stepstone',
    name: 'StepStone',
    baseUrl: 'https://www.stepstone.de',
    searchUrl: (query, location = 'Deutschland') =>
      `https://www.stepstone.de/jobs/?at=1&cn=1&jw=${encodeURIComponent(query)}&loc=${encodeURIComponent(location)}`,
    selector: '.job-item',
    fields: {
      id: 'data-job-id',
      title: '.job-title a',
      company: '.company',
      location: '.location',
      link: '.job-title a'
    }
  },
  stellenanzeigen: {
    id: 'stellenanzeigen',
    name: 'Stellenanzeigen.de',
    baseUrl: 'https://www.stellenanzeigen.de',
    searchUrl: (query, location = 'deutschland') =>
      `https://www.stellenanzeigen.de/jobs/?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`,
    selector: '.job-row',
    fields: {
      id: 'data-id',
      title: '.job-title',
      company: '.company-name',
      location: '.job-location',
      link: '.job-title a'
    }
  },
  workwise: {
    id: 'workwise',
    name: 'Workwise',
    baseUrl: 'https://workwise.io',
    searchUrl: (query, location = 'Germany') =>
      `https://workwise.io/jobs?keyword=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
    selector: '[data-test="job-card"]',
    fields: {
      id: 'data-job-id',
      title: '[data-test="job-title"]',
      company: '[data-test="company-name"]',
      location: '[data-test="job-location"]',
      link: '[data-test="job-title"] a'
    }
  }
};

export function getSource(id) {
  return SOURCES[id] || null;
}

export function listSources() {
  return Object.values(SOURCES);
}
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { Input } from '@/components';
import { Search, GitBranch, Star, Eye, AlertCircle, Check, ChevronDown, Github } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
  };
}

const getLanguageColor = (language: string | null): string => {
  if (!language) return 'bg-gray-400';

  const colorMap: Record<string, string> = {
    JavaScript: 'bg-[#f1e05a]',
    TypeScript: 'bg-[#3178c6]',
    HTML: 'bg-[#e34c26]',
    CSS: 'bg-[#563d7c]',
    Python: 'bg-[#3572A5]',
    Java: 'bg-[#b07219]',
    PHP: 'bg-[#4F5D95]',
    Ruby: 'bg-[#701516]',
    C: 'bg-[#555555]',
    'C++': 'bg-[#f34b7d]',
    'C#': 'bg-[#178600]',
    Go: 'bg-[#00ADD8]',
    Rust: 'bg-[#dea584]',
    Swift: 'bg-[#ffac45]',
    Kotlin: 'bg-[#A97BFF]',
    Dart: 'bg-[#00B4AB]',
    Shell: 'bg-[#89e051]',
    Dockerfile: 'bg-[#384d54]',
    Lua: 'bg-[#000080]',
    Vue: 'bg-[#41b883]',
    React: 'bg-[#61dafb]',
    Svelte: 'bg-[#ff3e00]',
  };

  return colorMap[language] || 'bg-[#8257e5]';
};

const GitHubRepos: React.FC = () => {
  const { t } = useTranslation();
  const defaultUsername = import.meta.env.VITE_GITHUB_USERNAME || '';
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [visibleRepos, setVisibleRepos] = useState<number>(12);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchRepositories = useCallback(async () => {
    if (!defaultUsername.trim()) {
      toast.error('No GitHub username configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.github.com/users/${defaultUsername}/repos?per_page=100`);

      if (!response.ok)
        throw new Error(response.status === 403 ? 'GitHub API rate limit exceeded. Please try again later.' : `Failed to fetch repositories: ${response.status}`);

      const data = await response.json();
      const sortedData = data.sort(
        (a: Repository, b: Repository) => b.watchers_count - a.watchers_count,
      );

      setRepos(sortedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repositories';
      setError(errorMessage);
      setRepos([]);

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [defaultUsername]);

  useEffect(() => {
    if (defaultUsername) fetchRepositories();
  }, [defaultUsername]);

  const languages = useMemo(() => {
    const languageSet = new Set<string>();
    repos.forEach(repo => {
      if (repo.language) {
        languageSet.add(repo.language);
      }
    });
    return ['', ...Array.from(languageSet)].sort();
  }, [repos]);

  const filteredRepos = useMemo(() => {
    return repos.filter(
      (repo) => {
        const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesLanguage = !selectedLanguage || repo.language === selectedLanguage;

        return matchesSearch && matchesLanguage;
      }
    );
  }, [repos, searchTerm, selectedLanguage]);

  const displayedRepos = useMemo(() => {
    return filteredRepos.slice(0, visibleRepos);
  }, [filteredRepos, visibleRepos]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 200 && displayedRepos.length < filteredRepos.length && !loading) {
        setVisibleRepos(prev => prev + 6);
      }
    }
  }, [displayedRepos.length, filteredRepos.length, loading]);

  const loadMore = () => {
    if (displayedRepos.length < filteredRepos.length && !loading) {
      setVisibleRepos(prev => prev + 6);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    setVisibleRepos(12);
  }, [searchTerm, selectedLanguage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="h-full bg-card border border-border/50 shadow-xl rounded-xl bg-white dark:bg-[#2B2D31] flex flex-col w-full mb-5">
      <Toaster richColors position="top-right" />

      <div ref={containerRef} className="container mx-auto p-2 sm:p-3 max-w-full rounded-xl overflow-y-auto [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-accent [&::-webkit-scrollbar-track]:bg-muted h-full">
        {repos.length > 0 && (
          <div className="mb-2 top-0 bg-card z-10 p-1.5 bg-white dark:bg-[#2B2D31] sticky">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              <div className="hidden sm:flex sm:items-center sm:mr-2">
                <a
                  href={`https://github.com/${defaultUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="GitHub Profile"
                >
                  <Github size={16} className="text-[#313338] dark:text-[#DCDDDE]" />
                </a>
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center justify-center relative">
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('github.search')}
                    className="px-7 py-1.5 bg-muted text-foreground w-full rounded-md border-none focus:ring-1 focus:ring-ring text-center text-xs"
                  />
                  <Search
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={14}
                  />
                </div>
              </div>

              {languages.length > 1 && (
                <div className="relative w-full sm:w-auto sm:min-w-[120px]" ref={dropdownRef}>
                  <button
                    onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                    className="flex items-center justify-between w-full p-1.5 bg-[#E3E5E8] dark:bg-[#2F3136] text-[#313338] dark:text-[#DCDDDE] rounded-md hover:bg-[#D1D3D7] dark:hover:bg-[#36393F] transition-all duration-200 text-xs"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {selectedLanguage ? (
                        <>
                          <div className={`w-2 h-2 flex-shrink-0 rounded-full ${getLanguageColor(selectedLanguage)}`}></div>
                          <span className="truncate">{selectedLanguage}</span>
                        </>
                      ) : (
                        <span className="text-[#6D6F78] dark:text-[#96989D] text-xs truncate">{t('github.filter')}</span>
                      )}
                    </div>
                    <ChevronDown size={12} className={`flex-shrink-0 transition-transform duration-200 ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {languageDropdownOpen && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-[#36393F] border border-[#E3E5E8] dark:border-[#202225] rounded-md shadow-lg max-h-48 overflow-auto py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C4C4C4] dark:[&::-webkit-scrollbar-thumb]:bg-[#4A4D53] [&::-webkit-scrollbar-track]:bg-transparent">
                      {languages.map((language) => (
                        <button
                          key={language || 'all'}
                          onClick={() => {
                            setSelectedLanguage(language);
                            setLanguageDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-2 py-1.5 text-xs hover:bg-[#F2F3F5] dark:hover:bg-[#2F3136] transition-colors ${selectedLanguage === language ? 'bg-[#F2F3F5] dark:bg-[#2F3136]' : ''}`}
                        >
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            {language ? (
                              <>
                                <div className={`w-2 h-2 flex-shrink-0 rounded-full ${getLanguageColor(language)}`}></div>
                                <span className="text-[#313338] dark:text-[#DCDDDE] truncate">{language}</span>
                              </>
                            ) : (
                              <span className="text-[#313338] dark:text-[#DCDDDE] truncate">{t('github.language')}</span>
                            )}
                          </div>
                          {selectedLanguage === language && <Check size={12} className="text-primary flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-1.5 p-2 sm:p-3 bg-destructive/20 rounded-md text-destructive mb-3 text-xs">
            <AlertCircle size={14} className="flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {displayedRepos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 dark:bg-[#2F3136] group rounded-lg p-2 sm:p-3 hover:bg-[#F2F3F5] dark:hover:bg-[#36393F] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border border-[#E3E5E8] dark:border-[#202225] shadow-md"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-1.5 gap-1">
                  <span className="group-hover:underline font-medium text-xs sm:text-sm block text-[#313338] dark:text-[#DCDDDE] truncate">
                    {repo.name}
                  </span>
                  <p className="text-[#6D6F78] dark:text-[#96989D] text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0">
                    {formatDate(repo.updated_at)}
                  </p>
                </div>

                <div className="h-7 sm:h-8 mb-2 overflow-hidden">
                  {repo.description ? (
                    <p className="text-[#6D6F78] dark:text-[#96989D] text-[10px] sm:text-xs line-clamp-2">{repo.description}</p>
                  ) : (
                    <p className="text-[#6D6F78] dark:text-[#96989D] italic opacity-50 text-[10px] sm:text-xs">{t('github.noDescription')}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-auto">
                  {repo.language && (
                    <div className="flex items-center">
                      <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${getLanguageColor(repo.language)} mr-1`}></div>
                      <span className="text-[10px] sm:text-xs text-[#6D6F78] dark:text-[#96989D] truncate">{repo.language}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="mr-0.5" size={10} />
                    <span className="text-[10px] sm:text-xs text-[#6D6F78] dark:text-[#96989D]">{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center">
                    <GitBranch className="mr-0.5" size={10} />
                    <span className="text-[10px] sm:text-xs text-[#6D6F78] dark:text-[#96989D]">{repo.forks_count}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="mr-0.5" size={10} />
                    <span className="text-[10px] sm:text-xs text-[#6D6F78] dark:text-[#96989D]">{repo.watchers_count}</span>
                  </div>
                </div>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {repo.topics.slice(0, 2).map((topic) => (
                      <span
                        key={topic}
                        className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium bg-[#5865F2]/10 text-[#5865F2] dark:bg-[#5865F2]/20 dark:text-[#8C9AFF] rounded-full truncate max-w-[80px]"
                      >
                        {topic}
                      </span>
                    ))}
                    {repo.topics.length > 2 && (
                      <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium bg-[#E3E5E8] dark:bg-[#4F545C] text-[#6D6F78] dark:text-[#96989D] rounded-full">
                        +{repo.topics.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>

        {displayedRepos.length < filteredRepos.length && !loading && (
          <div className="text-center py-2 sm:py-3 my-1">
            <button
              onClick={loadMore}
              className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-accent hover:bg-accent/80 text-accent-foreground rounded-md transition-colors"
            >
              {t('github.loadMore')}
            </button>
          </div>
        )}

        {repos.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-accent rounded-lg border border-border/50 shadow-lg">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🔍</div>
            <h3 className="text-sm sm:text-base font-medium mb-1 text-foreground">{t('github.noRepositories')}</h3>
            <p className="text-muted-foreground text-center text-[10px] sm:text-xs">{t('github.noRepositoriesConfigured')}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center p-4 sm:p-6">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubRepos;

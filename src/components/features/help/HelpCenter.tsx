'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { PageContainer, Stack } from '@/components/ui/Layout';
import { startAppTour } from '@/components/features/help/useTour';
import {
  HELP_DISCLAIMER,
  HELP_SECTIONS,
  HELP_TOPICS,
  type HelpTopic,
} from '@/content/help';

export function HelpCenter() {
  const [query, setQuery] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'getting-started': true,
    dashboard: true,
  });
  const [highlightedTopicId, setHighlightedTopicId] = useState<string | null>(null);

  // Group topics by section
  const topicsList = useMemo(() => Object.values(HELP_TOPICS), []);

  // Filter topics live based on query
  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topicsList;
    return topicsList.filter((t) => {
      return (
        t.title.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.howTo.toLowerCase().includes(q) ||
        t.tip.toLowerCase().includes(q) ||
        t.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [topicsList, query]);

  // Handle deep-link hashes (e.g. /help#calories-ring or /help#calories)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      // Find matching topic (either exact ID or prefix/fuzzy match)
      const match = topicsList.find(
        (t) => t.id === hash || t.id.startsWith(hash) || hash.startsWith(t.id),
      );

      if (match) {
        setOpenSections((prev) => ({ ...prev, [match.sectionId]: true }));
        setHighlightedTopicId(match.id);

        setTimeout(() => {
          const el = document.getElementById(match.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);

        // Fade highlight after 3 seconds
        setTimeout(() => {
          setHighlightedTopicId((cur) => (cur === match.id ? null : cur));
        }, 3200);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [topicsList]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <PageContainer>
      <Stack gap={24}>
        <PageHeader
          title="Help & Guides"
          subtitle="Everything you need to understand every number, chart, calculation, and feature in FitAI."
          actions={
            <Button
              onClick={startAppTour}
              data-testid="take-tour-button"
              className="flex items-center gap-2"
            >
              <Icon name="sparkle" size={16} />
              Take a quick tour
            </Button>
          }
        />

        {/* Medical disclaimer note */}
        <div
          role="note"
          className="flex items-start gap-3 rounded-[14px] border border-line bg-card p-4 text-[14px] leading-relaxed text-muted"
        >
          <Icon name="shield" size={20} className="mt-0.5 flex-none text-lime" />
          <p>{HELP_DISCLAIMER}</p>
        </div>

        {/* Live Search Field */}
        <div className="relative">
          <Field
            type="search"
            aria-label="Search help topics, metrics, and guides"
            data-testid="help-search-input"
            placeholder="Search topics, e.g. calories, progressive overload, protein, volume, privacy…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fieldSize="lg"
            className="placeholder:text-placeholder"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        {query.trim() && (
          <p className="text-[14px] text-muted" aria-live="polite">
            Found {filteredTopics.length} topic{filteredTopics.length === 1 ? '' : 's'} matching “{query.trim()}”
          </p>
        )}

        {/* Sections Accordion */}
        <div className="flex flex-col gap-4">
          {HELP_SECTIONS.map((section) => {
            const isFeedback = section.id === 'feedback';
            const sectionTopics = filteredTopics.filter(
              (t) => t.sectionId === section.id,
            );

            // Hide section if search query exists and no topics match
            if (query.trim() && sectionTopics.length === 0 && !isFeedback) {
              return null;
            }

            const isOpen = query.trim() ? true : !!openSections[section.id];

            return (
              <Card key={section.id} as="section" className="overflow-hidden p-0">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isOpen}
                  data-testid={`help-section-toggle-${section.id}`}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-raised"
                >
                  <div className="min-w-0 pr-4">
                    <h2 className="font-display text-[18px] font-bold text-fg md:text-[20px]">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-[13px] text-muted">
                      {section.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold text-muted">
                      {isFeedback ? 'Direct form' : `${sectionTopics.length} topic${sectionTopics.length === 1 ? '' : 's'}`}
                    </span>
                    <Icon
                      name="chevronLeft"
                      size={18}
                      className={clsx(
                        'text-muted transition-transform duration-200',
                        isOpen ? '-rotate-90' : 'rotate-180',
                      )}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-line bg-sidebar/50 p-5">
                    {isFeedback ? (
                      <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-card p-5">
                        <div>
                          <h3 className="font-display text-[17px] font-bold text-fg">
                            Have feedback or found an issue?
                          </h3>
                          <p className="mt-1 text-[14px] leading-relaxed text-muted">
                            FitAI is community-first. Report bugs, suggest food items for the database, or request new features.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setFeedbackOpen(true)}
                          data-testid="help-open-feedback-button"
                        >
                          Open feedback form
                        </Button>
                      </div>
                    ) : sectionTopics.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {sectionTopics.map((topic) => {
                          const isHighlighted = highlightedTopicId === topic.id;
                          return (
                            <TopicCard
                              key={topic.id}
                              topic={topic}
                              isHighlighted={isHighlighted}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-[14px] text-muted">
                        No topics match your search in this section.
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Stack>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </PageContainer>
  );
}

function TopicCard({
  topic,
  isHighlighted,
}: {
  topic: HelpTopic;
  isHighlighted: boolean;
}) {
  return (
    <article
      id={topic.id}
      data-testid={`help-topic-${topic.id}`}
      className={clsx(
        'rounded-2xl border p-5 transition-all duration-300',
        isHighlighted
          ? 'border-lime bg-lime-deep shadow-[0_0_20px_rgba(198,255,61,0.15)] ring-1 ring-lime'
          : 'border-line bg-card hover:border-line-hover',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-[17px] font-bold text-fg">
          {topic.title}
        </h3>
        <Pill tone="lime" className="text-[11px]">
          #{topic.id}
        </Pill>
      </div>

      <p className="mt-2.5 text-[14px] leading-relaxed text-soft">
        <strong className="text-fg">What it is: </strong>
        {topic.short}
      </p>

      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        <strong className="text-fg">How to use it: </strong>
        {topic.howTo}
      </p>

      <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-line bg-raised p-3 text-[13px] leading-relaxed">
        <Icon name="sparkle" size={16} className="mt-0.5 flex-none text-lime" />
        <div>
          <span className="font-semibold text-fg">FitAI Pro Tip: </span>
          <span className="text-soft">{topic.tip}</span>
        </div>
      </div>

      {topic.defaultExample && (
        <div className="mt-2 text-[12px] text-muted">
          <span className="font-semibold text-fg">Example: </span>
          <span>{topic.defaultExample}</span>
        </div>
      )}
    </article>
  );
}

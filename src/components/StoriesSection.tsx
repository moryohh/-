import React from 'react';
import { TeacherStory } from '../types';
import { Play, Volume2 } from 'lucide-react';
import { cleanTeacherName } from '../utils/cleanTeacherName';
import { extractYoutubeId } from '../services/lessonsService';
import { useAppTheme } from '../services/themeService';

interface StoriesSectionProps {
  stories: TeacherStory[];
  currentPlayingYoutubeId?: string;
  currentPlayingTeacher?: string;
  onSelectStory: (story: TeacherStory) => void;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  stories,
  currentPlayingYoutubeId,
  currentPlayingTeacher,
  onSelectStory,
}) => {
  const { theme } = useAppTheme();

  return (
    <div
      className={`py-2.5 px-2.5 ${theme.classes.cardBg} border-y ${theme.classes.cardBorder} shadow-inner transition-colors duration-300`}
    >
      {/* Teacher channels & Quiz section with tight spacing (gap-2) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {/* Teacher Channels Stories List - Clean circular images without bottom bars */}
        {stories
          .filter((story) => Boolean(extractYoutubeId(story.youtubeId, story.title, story.teacherName, story.textNotes)))
          .map((story, index) => {
            const rawTeacherName = story.teacherName || story.channelName || '';
            const cleanedName = cleanTeacherName(rawTeacherName) || 'مدرس المادة';
            const cleanedChannel = cleanTeacherName(story.channelName) || cleanedName;
            const validYt = extractYoutubeId(story.youtubeId, story.title, story.teacherName, story.textNotes);

            const isActive =
              (currentPlayingYoutubeId && validYt === currentPlayingYoutubeId) ||
              (currentPlayingTeacher &&
                (cleanTeacherName(story.teacherName) === cleanTeacherName(currentPlayingTeacher) ||
                  cleanTeacherName(story.channelName) === cleanTeacherName(currentPlayingTeacher)));

            return (
              <button
                key={story.id}
                onClick={() => onSelectStory(story)}
                className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer"
                title={`${cleanedName} - ${story.title || 'شرح المنهج'}`}
              >
                {/* Clean round circular thumbnail with theme-matching active glowing ring */}
                <div
                  className={`w-[74px] h-[74px] rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 active:scale-95 ${
                    isActive
                      ? 'scale-105'
                      : 'border border-white/20 opacity-85 hover:opacity-100'
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                          boxShadow: `0 0 15px ${theme.colors.glow}`,
                        }
                      : {}
                  }
                >
                  <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner bg-black">
                    <img
                      src={story.avatar}
                      alt={cleanedName}
                      className="w-full h-full object-cover"
                      width={74}
                      height={74}
                      loading={index < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={index === 0 ? 'high' : 'low'}
                    />

                    {/* Active playing pulse dot */}
                    {isActive && (
                      <div
                        className="absolute inset-0 border-2 rounded-full pointer-events-none"
                        style={{ borderColor: theme.colors.primary }}
                      />
                    )}
                  </div>
                </div>

                {/* Teacher Name Only */}
                <span
                  className={`text-[11px] mt-1 text-center truncate max-w-[84px] leading-tight font-bold transition-colors ${
                    isActive ? '' : theme.classes.textMain
                  }`}
                  style={isActive ? { color: theme.colors.primary } : {}}
                >
                  {cleanedName}
                </span>

                {/* Subtitle / Channel */}
                <span
                  className={`text-[9px] ${theme.classes.textMuted} truncate max-w-[84px] leading-tight mt-0.5`}
                >
                  {cleanedChannel}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import KoganCreekVPPExhibit from './KoganCreekVPPExhibit';
import BerlinArbitrageExhibit from './BerlinArbitrageExhibit';
import WithoutVPPExhibit from './WithoutVPPExhibit';

const TABS = [
  {
    id: 'frequency',
    title: 'Frequency Response',
    desc: 'Kogan Creek, Nov 2019 -- 1,100 homes stabilize the grid in seconds',
    color: '#10b981',
  },
  {
    id: 'arbitrage',
    title: 'Energy Arbitrage',
    desc: 'Berlin fleet -- 500 homes earn revenue through daily price spread',
    color: '#f59e0b',
  },
  {
    id: 'without',
    title: 'Without a VPP',
    desc: 'South Australia, Sep 2016 -- total system black in 43 seconds',
    color: '#ef4444',
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function VPPExhibitTabs({ height = 500 }: { height?: number }) {
  const [activeTab, setActiveTab] = useState<TabId>('frequency');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  const exhibitHeight = isFullscreen ? undefined : height;

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: isFullscreen ? '#020408' : 'transparent',
        width: isFullscreen ? '100vw' : undefined,
        height: isFullscreen ? '100vh' : undefined,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid rgba(161, 161, 170, 0.12)',
          background: isFullscreen ? 'rgba(5, 8, 16, 0.95)' : 'rgba(5, 8, 16, 0.5)',
          flexShrink: 0,
          position: isFullscreen ? 'sticky' : undefined,
          top: isFullscreen ? 0 : undefined,
          zIndex: 30,
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 16px 10px',
                background: isActive
                  ? `${tab.color}12`
                  : 'rgba(26, 34, 54, 0.5)',
                border: 'none',
                borderBottom: isActive
                  ? `3px solid ${tab.color}`
                  : '3px solid rgba(100, 116, 139, 0.2)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                opacity: 1,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(26, 34, 54, 0.8)';
                  e.currentTarget.style.borderBottomColor = `${tab.color}60`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(26, 34, 54, 0.5)';
                  e.currentTarget.style.borderBottomColor = 'rgba(100, 116, 139, 0.2)';
                }
              }}
            >
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isActive ? tab.color : '#94a3b8',
                  marginBottom: 3,
                }}
              >
                {tab.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: isActive ? '#94a3b8' : '#64748b',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {tab.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active exhibit */}
      <div
        style={{
          flex: isFullscreen ? 1 : undefined,
          position: 'relative',
          minHeight: 0,
        }}
      >
        {activeTab === 'frequency' && (
          <KoganCreekVPPExhibit height={exhibitHeight} />
        )}
        {activeTab === 'arbitrage' && (
          <BerlinArbitrageExhibit height={exhibitHeight} />
        )}
        {activeTab === 'without' && (
          <WithoutVPPExhibit height={exhibitHeight} />
        )}
      </div>

      {/* Fullscreen exit button */}
      {isFullscreen && (
        <button
          onClick={() => document.exitFullscreen?.()}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 40,
            background: 'rgba(5, 8, 16, 0.7)',
            border: '1px solid rgba(161, 161, 170, 0.3)',
            borderRadius: 4,
            color: 'rgba(161, 161, 170, 0.7)',
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(161, 161, 170, 1)';
            e.currentTarget.style.borderColor = 'rgba(161, 161, 170, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(161, 161, 170, 0.7)';
            e.currentTarget.style.borderColor = 'rgba(161, 161, 170, 0.3)';
          }}
          title="Exit fullscreen (Esc)"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 1v3H0M9 1v3h3M9 11V8h3M3 11V8H0" />
          </svg>
          <span>Esc to exit</span>
        </button>
      )}
    </div>
  );
}

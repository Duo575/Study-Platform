import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnvironmentProvider, EnvironmentSelector } from '../index';
import { useEnvironmentStore } from '../../../store/environmentStore';

// Mock the environment store
vi.mock('../../../store/environmentStore');

const mockUseEnvironmentStore = vi.mocked(useEnvironmentStore);

describe('Environment Integration', () => {
  beforeEach(() => {
    mockUseEnvironmentStore.mockReturnValue({
      currentEnvironment: {
        id: 'classroom',
        name: 'Classroom',
        category: 'free',
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          backgroundColor: '#F8FAFC',
          textColor: '#1F2937',
          accentColor: '#10B981',
          cssVariables: {
            '--env-primary': '#3B82F6',
            '--env-secondary': '#1E40AF',
            '--env-bg': '#F8FAFC',
            '--env-text': '#1F2937',
            '--env-accent': '#10B981',
          },
        },
        audio: {
          ambientTrack: 'classroom-ambient',
          musicTracks: [],
          soundEffects: {},
          defaultVolume: 0.3,
        },
        visuals: {
          backgroundImage: '/environments/classroom-bg.jpg',
          overlayElements: [],
          particleEffects: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      availableEnvironments: [
        {
          id: 'classroom',
          name: 'Classroom',
          category: 'free',
          theme: {
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            backgroundColor: '#F8FAFC',
            textColor: '#1F2937',
            accentColor: '#10B981',
            cssVariables: {
              '--env-primary': '#3B82F6',
              '--env-secondary': '#1E40AF',
              '--env-bg': '#F8FAFC',
              '--env-text': '#1F2937',
              '--env-accent': '#10B981',
            },
          },
          audio: {
            ambientTrack: 'classroom-ambient',
            musicTracks: [],
            soundEffects: {},
            defaultVolume: 0.3,
          },
          visuals: {
            backgroundImage: '/environments/classroom-bg.jpg',
            overlayElements: [],
            particleEffects: [],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      unlockedEnvironments: ['classroom'],
      isLoading: false,
      error: null,
      loadEnvironments: vi.fn(),
      switchEnvironment: vi.fn(),
      isSwitchingEnvironment: false,
      setError: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders EnvironmentProvider without crashing', () => {
    render(
      <EnvironmentProvider>
        <div>Test content</div>
      </EnvironmentProvider>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders EnvironmentSelector with current environment', async () => {
    render(
      <EnvironmentProvider>
        <EnvironmentSelector />
      </EnvironmentProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Classroom')).toBeInTheDocument();
    });
  });

  it('applies CSS variables when environment is set', () => {
    render(
      <EnvironmentProvider>
        <div>Test content</div>
      </EnvironmentProvider>
    );

    // Check if CSS variables are applied to document root
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--env-primary')).toBe('#3B82F6');
    expect(root.style.getPropertyValue('--env-secondary')).toBe('#1E40AF');
  });

  it('wraps content with environment data attribute', () => {
    const { container } = render(
      <EnvironmentProvider>
        <div>Test content</div>
      </EnvironmentProvider>
    );

    const wrapper = container.querySelector('.environment-wrapper');
    expect(wrapper).toHaveAttribute('data-environment', 'classroom');
  });
});

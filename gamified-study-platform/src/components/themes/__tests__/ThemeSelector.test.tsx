import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeSelector } from '../ThemeSelector';
import { useThemeStore } from '../../../store/themeStore';

// Mock the theme store
jest.mock('../../../store/themeStore');
const mockUseThemeStore = useThemeStore as jest.MockedFunction<
  typeof useThemeStore
>;

// Mock the theme service
jest.mock('../../../services/themeService', () => ({
  themeService: {
    loadSavedTheme: jest.fn(),
    applyTheme: jest.fn(),
    previewTheme: jest.fn(),
    stopPreview: jest.fn(),
    getThemeCustomizations: jest.fn(() => null),
  },
}));

const mockThemes = [
  {
    id: 'default-light',
    name: 'Classic Light',
    description: 'Clean and bright theme',
    category: 'light' as const,
    cssVariables: {
      '--theme-primary': '#3B82F6',
      '--theme-background': '#FFFFFF',
    },
    previewImages: [],
    price: 0,
    currency: 'coins' as const,
    rarity: 'common' as const,
    isUnlocked: true,
    isPurchased: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'forest-green',
    name: 'Forest Serenity',
    description: 'Nature-inspired green theme',
    category: 'nature' as const,
    cssVariables: {
      '--theme-primary': '#059669',
      '--theme-background': '#ECFDF5',
    },
    previewImages: [],
    price: 250,
    currency: 'coins' as const,
    rarity: 'common' as const,
    isUnlocked: false,
    isPurchased: false,
    unlockRequirements: [
      {
        type: 'coins' as const,
        target: 250,
        current: 0,
        description: 'Purchase for 250 coins',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockStoreState = {
  themes: mockThemes,
  currentTheme: mockThemes[0],
  unlockedThemes: ['default-light'],
  purchasedThemes: ['default-light'],
  isApplyingTheme: false,
  isPurchasingTheme: false,
  isUnlockingTheme: false,
  isPreviewingTheme: false,
  previewTheme: null,
  applyTheme: jest.fn(),
  purchaseTheme: jest.fn(),
  unlockTheme: jest.fn(),
  previewTheme: jest.fn(),
  stopPreview: jest.fn(),
  loadThemes: jest.fn(),
};

describe('ThemeSelector', () => {
  beforeEach(() => {
    mockUseThemeStore.mockReturnValue(mockStoreState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders theme selector when open', () => {
    render(<ThemeSelector isOpen={true} onClose={jest.fn()} />);

    expect(screen.getByText('Theme Selection')).toBeInTheDocument();
    expect(
      screen.getByText('Customize your study environment with beautiful themes')
    ).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ThemeSelector isOpen={false} onClose={jest.fn()} />);

    expect(screen.queryByText('Theme Selection')).not.toBeInTheDocument();
  });

  it('displays available themes', async () => {
    render(<ThemeSelector isOpen={true} onClose={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Classic Light')).toBeInTheDocument();
      expect(screen.getByText('Forest Serenity')).toBeInTheDocument();
    });
  });

  it('shows current theme status', async () => {
    render(<ThemeSelector isOpen={true} onClose={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Current Theme:/)).toBeInTheDocument();
      expect(screen.getByText('Classic Light')).toBeInTheDocument();
    });
  });

  it('filters themes by search query', async () => {
    render(<ThemeSelector isOpen={true} onClose={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search themes...');
    fireEvent.change(searchInput, { target: { value: 'Forest' } });

    await waitFor(() => {
      expect(screen.getByText('Forest Serenity')).toBeInTheDocument();
      expect(screen.queryByText('Classic Light')).not.toBeInTheDocument();
    });
  });

  it('filters themes by category', async () => {
    render(<ThemeSelector isOpen={true} onClose={jest.fn()} />);

    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'nature' } });

    await waitFor(() => {
      expect(screen.getByText('Forest Serenity')).toBeInTheDocument();
      expect(screen.queryByText('Classic Light')).not.toBeInTheDocument();
    });
  });

  it('applies theme when clicking on unlocked theme', async () => {
    render(<ThemeSelector isOpen={true} onClose={jest.fn()} />);

    const themeCard = screen.getByText('Classic Light').closest('.theme-card');
    if (themeCard) {
      fireEvent.click(themeCard);
    }

    await waitFor(() => {
      expect(mockStoreState.applyTheme).toHaveBeenCalledWith('default-light');
    });
  });

  it('shows theme details for locked themes', async () => {
    render(<ThemeSelector isOpen={true} onClose={jest.fn()} />);

    const lockedThemeCard = screen
      .getByText('Forest Serenity')
      .closest('.theme-card');
    if (lockedThemeCard) {
      fireEvent.click(lockedThemeCard);
    }

    await waitFor(() => {
      expect(screen.getByText('Purchase for 250 coins')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<ThemeSelector isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('loads themes when opened', () => {
    render(<ThemeSelector isOpen={true} onClose={jest.fn()} />);

    expect(mockStoreState.loadThemes).toHaveBeenCalled();
  });

  it('displays theme rarity badges', async () => {
    render(<ThemeSelector isOpen={true} onClose={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getAllByText('COMMON')).toHaveLength(2);
    });
  });

  it('shows preview button for unlocked themes', async () => {
    render(<ThemeSelector isOpen={true} onClose={jest.fn()} />);

    // The current theme shouldn't have a preview button, but other unlocked themes should
    await waitFor(() => {
      const previewButtons = screen.queryAllByText('Preview');
      // Since only one theme is unlocked and it's the current theme, there should be no preview buttons
      expect(previewButtons).toHaveLength(0);
    });
  });
});

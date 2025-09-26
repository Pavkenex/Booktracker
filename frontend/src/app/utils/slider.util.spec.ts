import { SliderBreakpoints, SliderItemsConfig, SliderUtil } from './slider.util';

describe('SliderUtil', () => {
  const breakpoints: SliderBreakpoints = {
    MOBILE: 576,
    TABLET: 768,
    DESKTOP: 992,
  };

  const itemsConfig: SliderItemsConfig = {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3,
    LARGE: 4,
  };

  describe('calculateItemsPerSlide', () => {
    it('returns mobile configuration for very small screens', () => {
      expect(SliderUtil.calculateItemsPerSlide(320, breakpoints, itemsConfig)).toBe(1);
    });

    it('returns tablet configuration between mobile and tablet breakpoints', () => {
      expect(SliderUtil.calculateItemsPerSlide(600, breakpoints, itemsConfig)).toBe(2);
    });

    it('returns desktop configuration between tablet and desktop breakpoints', () => {
      expect(SliderUtil.calculateItemsPerSlide(800, breakpoints, itemsConfig)).toBe(3);
    });

    it('returns large configuration above desktop breakpoint', () => {
      expect(SliderUtil.calculateItemsPerSlide(1200, breakpoints, itemsConfig)).toBe(4);
    });

    it('throws when screen width is negative', () => {
      expect(() =>
        SliderUtil.calculateItemsPerSlide(-10, breakpoints, itemsConfig)
      ).toThrowError('Screen width cannot be negative');
    });
  });

  describe('safeCalculateItemsPerSlide', () => {
    it('wraps successful calculations in a success result', () => {
      const result = SliderUtil.safeCalculateItemsPerSlide(1280, breakpoints, itemsConfig);
      expect(result).toEqual({ success: true, data: 4 });
    });

    it('wraps failures without throwing', () => {
      const invalidBreakpoints = { ...breakpoints, MOBILE: -1 } as SliderBreakpoints;
      const result = SliderUtil.safeCalculateItemsPerSlide(320, invalidBreakpoints, itemsConfig);
      expect(result.success).toBeFalse();
      expect(result).toEqual(jasmine.objectContaining({ error: jasmine.any(String) }));
    });
  });

  describe('calculateTotalSlides', () => {
    it('calculates total slides using ceiling division', () => {
      expect(SliderUtil.calculateTotalSlides(10, 4)).toBe(3);
      expect(SliderUtil.calculateTotalSlides(12, 4)).toBe(3);
      expect(SliderUtil.calculateTotalSlides(13, 4)).toBe(4);
    });
  });

  describe('calculateMaxSlide', () => {
    it('returns zero for a single slide and totalSlides - 1 otherwise', () => {
      expect(SliderUtil.calculateMaxSlide(0)).toBe(0);
      expect(SliderUtil.calculateMaxSlide(1)).toBe(0);
      expect(SliderUtil.calculateMaxSlide(4)).toBe(3);
    });
  });

  describe('getSlideItems', () => {
    const items = ['A', 'B', 'C', 'D', 'E'];

    it('returns a shallow copy of items for the given slide', () => {
      expect(SliderUtil.getSlideItems(items, 0, 2)).toEqual(['A', 'B']);
      expect(SliderUtil.getSlideItems(items, 1, 2)).toEqual(['C', 'D']);
      expect(SliderUtil.getSlideItems(items, 2, 2)).toEqual(['E']);
    });

    it('returns an empty array when requesting an invalid slide', () => {
      expect(SliderUtil.getSlideItems(items, -1, 2)).toEqual([]);
      expect(SliderUtil.getSlideItems([], 0, 2)).toEqual([]);
    });
  });

  describe('adjustSlideIndex', () => {
    it('caps the slide index to the maximum slide', () => {
      expect(SliderUtil.adjustSlideIndex(5, 10, 3)).toBe(3);
      expect(SliderUtil.adjustSlideIndex(1, 10, 3)).toBe(1);
    });
  });

  describe('createSlideIndicators', () => {
    it('creates a zero-based array of slide indices', () => {
      expect(SliderUtil.createSlideIndicators(0)).toEqual([]);
      expect(SliderUtil.createSlideIndicators(3)).toEqual([0, 1, 2]);
    });
  });
});

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useAnimatedRef,
  measure,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 3;
const DOT_SIZE = 36;
const GRID_PADDING = 40;
const GRID_WIDTH = Math.min(SCREEN_WIDTH - GRID_PADDING * 2, 280);
const CELL_SIZE = GRID_WIDTH / GRID_SIZE;
// Very generous detection radius - 100% of cell size means dots overlap in detection
const DETECTION_RADIUS = CELL_SIZE * 0.95;

interface Point {
  row: number;
  col: number;
  x: number; // Center X relative to grid
  y: number; // Center Y relative to grid
  index: number;
}

interface PatternLockProps {
  onPatternComplete: (pattern: number[]) => void;
  disabled?: boolean;
}

export default function PatternLock({ onPatternComplete, disabled = false }: PatternLockProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Use animated ref to measure container position
  const containerRef = useAnimatedRef<Animated.View>();

  // Store container's absolute position on screen
  const containerPageX = useSharedValue(0);
  const containerPageY = useSharedValue(0);

  // Current touch position for drawing line to finger
  const touchX = useSharedValue(0);
  const touchY = useSharedValue(0);
  const isActive = useSharedValue(false);

  // Track selected indices in a ref that persists across gesture updates
  const selectedRef = useSharedValue<number[]>([]);

  // Generate grid points (relative to container)
  const points: Point[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const index = row * GRID_SIZE + col;
      points.push({
        row,
        col,
        x: col * CELL_SIZE + CELL_SIZE / 2,
        y: row * CELL_SIZE + CELL_SIZE / 2,
        index,
      });
    }
  }

  // Find point at absolute screen position
  const findPointAtAbsolutePosition = (absX: number, absY: number): number | null => {
    'worklet';
    // Convert absolute position to relative position within container
    const relX = absX - containerPageX.value;
    const relY = absY - containerPageY.value;

    let closestIndex: number | null = null;
    let closestDist = Infinity;

    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const pointX = col * CELL_SIZE + CELL_SIZE / 2;
      const pointY = row * CELL_SIZE + CELL_SIZE / 2;

      const dx = relX - pointX;
      const dy = relY - pointY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < DETECTION_RADIUS && dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    }
    return closestIndex;
  };

  // Update React state from worklet
  const updateSelectedIndices = useCallback((indices: number[]) => {
    setSelectedIndices([...indices]);
  }, []);

  const completePattern = useCallback((indices: number[]) => {
    if (indices.length >= 4) {
      onPatternComplete(indices);
    }
    // Reset after delay
    setTimeout(() => {
      setSelectedIndices([]);
    }, 400);
  }, [onPatternComplete]);

  // Measure container position when layout changes
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    // Use measure to get absolute position
    const node = containerRef.current;
    if (node) {
      // @ts-ignore - measure exists on animated ref
      node.measure?.((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        containerPageX.value = pageX;
        containerPageY.value = pageY;
      });
    }
  }, [containerRef, containerPageX, containerPageY]);

  // Pan gesture using absoluteX/absoluteY for reliable tracking
  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .shouldCancelWhenOutside(false)
    .minDistance(0)
    .onBegin((event) => {
      'worklet';
      // Measure container position at gesture start
      const measured = measure(containerRef);
      if (measured) {
        containerPageX.value = measured.pageX;
        containerPageY.value = measured.pageY;
      }
    })
    .onStart((event) => {
      'worklet';
      isActive.value = true;
      selectedRef.value = [];

      // Use absoluteX/absoluteY for reliable cross-platform tracking
      const absX = event.absoluteX;
      const absY = event.absoluteY;

      touchX.value = absX - containerPageX.value;
      touchY.value = absY - containerPageY.value;

      const pointIndex = findPointAtAbsolutePosition(absX, absY);
      if (pointIndex !== null) {
        selectedRef.value = [pointIndex];
        runOnJS(updateSelectedIndices)([pointIndex]);
      }
    })
    .onUpdate((event) => {
      'worklet';
      const absX = event.absoluteX;
      const absY = event.absoluteY;

      // Update touch position for trailing line
      touchX.value = absX - containerPageX.value;
      touchY.value = absY - containerPageY.value;

      const pointIndex = findPointAtAbsolutePosition(absX, absY);
      if (pointIndex !== null && !selectedRef.value.includes(pointIndex)) {
        selectedRef.value = [...selectedRef.value, pointIndex];
        runOnJS(updateSelectedIndices)(selectedRef.value);
      }
    })
    .onEnd(() => {
      'worklet';
      isActive.value = false;
      runOnJS(completePattern)(selectedRef.value);
    })
    .onFinalize(() => {
      'worklet';
      isActive.value = false;
    });

  // Render connection lines between selected points
  const renderLines = () => {
    const lines = [];
    for (let i = 1; i < selectedIndices.length; i++) {
      const prevPoint = points[selectedIndices[i - 1]];
      const currPoint = points[selectedIndices[i]];
      if (prevPoint && currPoint) {
        const dx = currPoint.x - prevPoint.x;
        const dy = currPoint.y - prevPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        lines.push(
          <View
            key={`line-${i}`}
            style={[
              styles.line,
              {
                left: prevPoint.x,
                top: prevPoint.y - 4,
                width: length,
                transform: [{ rotate: `${angle}rad` }],
              },
            ]}
          />
        );
      }
    }
    return lines;
  };

  // Animated style for trailing line to finger
  const trailingLineStyle = useAnimatedStyle(() => {
    if (!isActive.value || selectedRef.value.length === 0) {
      return { opacity: 0 };
    }

    const lastIndex = selectedRef.value[selectedRef.value.length - 1];
    const lastRow = Math.floor(lastIndex / 3);
    const lastCol = lastIndex % 3;
    const lastX = lastCol * CELL_SIZE + CELL_SIZE / 2;
    const lastY = lastRow * CELL_SIZE + CELL_SIZE / 2;

    const dx = touchX.value - lastX;
    const dy = touchY.value - lastY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      opacity: 0.5,
      left: lastX,
      top: lastY - 4,
      width: length,
      transform: [{ rotate: `${angle}deg` }],
    };
  });

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          ref={containerRef}
          style={styles.container}
          onLayout={handleLayout}
        >
          {/* Connection lines */}
          {renderLines()}

          {/* Trailing line to finger */}
          <Animated.View style={[styles.line, styles.trailingLine, trailingLineStyle]} />

          {/* Dots */}
          {points.map((point) => {
            const isSelected = selectedIndices.includes(point.index);
            const isFirst = selectedIndices[0] === point.index;
            const isLast = selectedIndices[selectedIndices.length - 1] === point.index;

            return (
              <View
                key={point.index}
                style={[
                  styles.dotOuter,
                  {
                    left: point.x - DOT_SIZE / 2,
                    top: point.y - DOT_SIZE / 2,
                  },
                  isSelected && styles.dotOuterSelected,
                ]}
              >
                <View
                  style={[
                    styles.dotInner,
                    isSelected && styles.dotInnerSelected,
                    isFirst && styles.dotInnerFirst,
                    isLast && isActive && styles.dotInnerLast,
                  ]}
                />
              </View>
            );
          })}
        </Animated.View>
      </GestureDetector>

      {/* Hint text */}
      <View style={styles.hintContainer}>
        <Animated.View style={[styles.hintDot, { opacity: isActive ? 1 : 0.3 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: {
    width: GRID_WIDTH,
    height: GRID_WIDTH,
    position: 'relative',
  },
  dotOuter: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOuterSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
    transform: [{ scale: 1.15 }],
  },
  dotInner: {
    width: DOT_SIZE * 0.35,
    height: DOT_SIZE * 0.35,
    borderRadius: DOT_SIZE * 0.175,
    backgroundColor: colors.border,
  },
  dotInnerSelected: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.2 }],
  },
  dotInnerFirst: {
    backgroundColor: colors.primaryDark,
  },
  dotInnerLast: {
    transform: [{ scale: 1.4 }],
  },
  line: {
    position: 'absolute',
    height: 8,
    backgroundColor: colors.primary,
    transformOrigin: 'left center',
    borderRadius: 4,
  },
  trailingLine: {
    backgroundColor: colors.primaryLight,
  },
  hintContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  hintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});

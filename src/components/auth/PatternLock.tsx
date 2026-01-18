import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, GestureResponderEvent } from 'react-native';
import { colors } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 3;
const DOT_SIZE = 36;
const GRID_PADDING = 40;
const GRID_WIDTH = Math.min(SCREEN_WIDTH - GRID_PADDING * 2, 280);
const CELL_SIZE = GRID_WIDTH / GRID_SIZE;
// Very generous detection radius for thick fingers
const DETECTION_RADIUS = CELL_SIZE * 0.95;

interface Point {
  row: number;
  col: number;
  x: number;
  y: number;
  index: number;
}

interface PatternLockProps {
  onPatternComplete: (pattern: number[]) => void;
  disabled?: boolean;
}

export default function PatternLock({ onPatternComplete, disabled = false }: PatternLockProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });

  // Store container position on screen
  const containerPos = useRef({ pageX: 0, pageY: 0 });
  // Track current selection during gesture
  const currentSelection = useRef<number[]>([]);

  // Generate grid points
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

  // Find point at position (using pageX/pageY for reliability)
  const findPointAtPosition = useCallback((pageX: number, pageY: number): number | null => {
    const relX = pageX - containerPos.current.pageX;
    const relY = pageY - containerPos.current.pageY;

    let closestIndex: number | null = null;
    let closestDist = Infinity;

    for (const point of points) {
      const dx = relX - point.x;
      const dy = relY - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < DETECTION_RADIUS && dist < closestDist) {
        closestDist = dist;
        closestIndex = point.index;
      }
    }
    return closestIndex;
  }, [points]);

  // Handle touch at position
  const handleTouchAtPosition = useCallback((pageX: number, pageY: number) => {
    // Update touch position for trailing line
    const relX = pageX - containerPos.current.pageX;
    const relY = pageY - containerPos.current.pageY;
    setTouchPos({ x: relX, y: relY });

    const pointIndex = findPointAtPosition(pageX, pageY);
    if (pointIndex !== null && !currentSelection.current.includes(pointIndex)) {
      currentSelection.current = [...currentSelection.current, pointIndex];
      setSelectedIndices([...currentSelection.current]);
    }
  }, [findPointAtPosition]);

  // Create pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderTerminationRequest: () => false, // Don't let other views steal gesture

      onPanResponderGrant: (evt: GestureResponderEvent) => {
        // Reset selection
        currentSelection.current = [];
        setSelectedIndices([]);
        setIsDrawing(true);

        // Use pageX/pageY for reliable cross-platform tracking
        const { pageX, pageY } = evt.nativeEvent;
        handleTouchAtPosition(pageX, pageY);
      },

      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { pageX, pageY } = evt.nativeEvent;
        handleTouchAtPosition(pageX, pageY);
      },

      onPanResponderRelease: () => {
        setIsDrawing(false);
        const pattern = currentSelection.current;

        if (pattern.length >= 4) {
          onPatternComplete(pattern);
        }

        // Reset after delay
        setTimeout(() => {
          currentSelection.current = [];
          setSelectedIndices([]);
        }, 400);
      },

      onPanResponderTerminate: () => {
        setIsDrawing(false);
        currentSelection.current = [];
        setSelectedIndices([]);
      },
    })
  ).current;

  // Measure container position
  const handleLayout = useCallback(() => {
    // Use a small timeout to ensure layout is complete
    setTimeout(() => {
      const node = containerRef.current;
      if (node) {
        node.measure((x, y, width, height, pageX, pageY) => {
          containerPos.current = { pageX, pageY };
        });
      }
    }, 100);
  }, []);

  const containerRef = useRef<View>(null);

  // Render connection lines
  const renderLines = () => {
    const lines = [];
    for (let i = 1; i < selectedIndices.length; i++) {
      const prevPoint = points[selectedIndices[i - 1]];
      const currPoint = points[selectedIndices[i]];
      if (prevPoint && currPoint) {
        const dx = currPoint.x - prevPoint.x;
        const dy = currPoint.y - prevPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        lines.push(
          <View
            key={`line-${i}`}
            style={[
              styles.line,
              {
                left: prevPoint.x,
                top: prevPoint.y - 4,
                width: length,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        );
      }
    }

    // Trailing line to finger
    if (isDrawing && selectedIndices.length > 0) {
      const lastPoint = points[selectedIndices[selectedIndices.length - 1]];
      if (lastPoint) {
        const dx = touchPos.x - lastPoint.x;
        const dy = touchPos.y - lastPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        lines.push(
          <View
            key="trailing"
            style={[
              styles.line,
              styles.trailingLine,
              {
                left: lastPoint.x,
                top: lastPoint.y - 4,
                width: length,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        );
      }
    }

    return lines;
  };

  return (
    <View style={styles.wrapper}>
      <View
        ref={containerRef}
        style={styles.container}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {/* Connection lines */}
        {renderLines()}

        {/* Dots */}
        {points.map((point) => {
          const isSelected = selectedIndices.includes(point.index);
          const isFirst = selectedIndices[0] === point.index;
          const isLast = selectedIndices[selectedIndices.length - 1] === point.index && isDrawing;

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
                  isLast && styles.dotInnerLast,
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* Status indicator */}
      <View style={styles.hintContainer}>
        <View style={[styles.hintDot, { opacity: isDrawing ? 1 : 0.3 }]} />
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
    opacity: 0.6,
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

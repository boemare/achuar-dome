import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_SIZE = 3;
const DOT_SIZE = 32;
const GRID_PADDING = 50;
const GRID_WIDTH = Math.min(SCREEN_WIDTH - GRID_PADDING * 2, 300);
const CELL_SIZE = GRID_WIDTH / GRID_SIZE;
// Detection radius - very generous for thick fingers
const DETECTION_RADIUS = CELL_SIZE * 0.9;

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
  const selectedIndicesRef = useRef<number[]>([]); // Ref to track current selection
  const currentX = useSharedValue(0);
  const currentY = useSharedValue(0);
  const isDrawing = useSharedValue(false);
  const containerLayout = useRef({ x: 0, y: 0 });

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

  const findPointAtPosition = (x: number, y: number): Point | null => {
    let closest: Point | null = null;
    let closestDist = Infinity;

    for (const point of points) {
      const dx = x - point.x;
      const dy = y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < DETECTION_RADIUS && dist < closestDist) {
        closest = point;
        closestDist = dist;
      }
    }
    return closest;
  };

  const addPointToPattern = (pointIndex: number) => {
    if (!selectedIndicesRef.current.includes(pointIndex)) {
      const newIndices = [...selectedIndicesRef.current, pointIndex];
      selectedIndicesRef.current = newIndices;
      setSelectedIndices(newIndices);
    }
  };

  const resetPattern = () => {
    selectedIndicesRef.current = [];
    setSelectedIndices([]);
  };

  const completePattern = () => {
    const indices = selectedIndicesRef.current;
    if (indices.length >= 4) {
      onPatternComplete(indices);
    }
    // Reset after a short delay to show the final pattern
    setTimeout(() => {
      selectedIndicesRef.current = [];
      setSelectedIndices([]);
    }, 300);
  };

  const startNewPattern = () => {
    selectedIndicesRef.current = [];
    setSelectedIndices([]);
  };

  // Handle touch at position - checks for points and adds them
  const handleTouchAtPosition = (x: number, y: number) => {
    const point = findPointAtPosition(x, y);
    if (point) {
      addPointToPattern(point.index);
    }
  };

  // Handle gesture start
  const handleGestureStart = (x: number, y: number) => {
    startNewPattern();
    handleTouchAtPosition(x, y);
  };

  // Use react-native-gesture-handler for better tracking
  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .shouldCancelWhenOutside(false) // KEY: Continue tracking outside bounds
    .minDistance(0)
    .onStart((event) => {
      'worklet';
      isDrawing.value = true;
      currentX.value = event.x;
      currentY.value = event.y;
      runOnJS(handleGestureStart)(event.x, event.y);
    })
    .onUpdate((event) => {
      'worklet';
      currentX.value = event.x;
      currentY.value = event.y;
      runOnJS(handleTouchAtPosition)(event.x, event.y);
    })
    .onEnd(() => {
      'worklet';
      isDrawing.value = false;
      runOnJS(completePattern)();
    })
    .onFinalize(() => {
      'worklet';
      isDrawing.value = false;
    });

  // Animated style for the current tracking line
  const trackingLineStyle = useAnimatedStyle(() => {
    if (!isDrawing.value || selectedIndices.length === 0) {
      return { opacity: 0 };
    }
    return { opacity: 0.5 };
  });

  // Get the last selected point for drawing the tracking line
  const getLastSelectedPoint = (): Point | null => {
    if (selectedIndices.length === 0) return null;
    const lastIndex = selectedIndices[selectedIndices.length - 1];
    return points.find(p => p.index === lastIndex) || null;
  };

  // Render connection lines between selected points
  const renderLines = () => {
    const lines = [];
    for (let i = 1; i < selectedIndices.length; i++) {
      const prevPoint = points.find(p => p.index === selectedIndices[i - 1]);
      const currPoint = points.find(p => p.index === selectedIndices[i]);
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
                top: prevPoint.y - 3,
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

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={styles.container}
          onLayout={(e) => {
            containerLayout.current = {
              x: e.nativeEvent.layout.x,
              y: e.nativeEvent.layout.y,
            };
          }}
        >
          {/* Connection lines */}
          {renderLines()}

          {/* Dots */}
          {points.map((point) => {
            const isSelected = selectedIndices.includes(point.index);
            return (
              <View
                key={point.index}
                style={[
                  styles.dot,
                  {
                    left: point.x - DOT_SIZE / 2,
                    top: point.y - DOT_SIZE / 2,
                  },
                  isSelected && styles.dotSelected,
                ]}
              >
                {isSelected && <View style={styles.dotInner} />}
              </View>
            );
          })}

          {/* Touch area indicator (invisible but shows the detection zone) */}
          {__DEV__ && false && points.map((point) => (
            <View
              key={`zone-${point.index}`}
              style={[
                styles.debugZone,
                {
                  left: point.x - DETECTION_RADIUS,
                  top: point.y - DETECTION_RADIUS,
                  width: DETECTION_RADIUS * 2,
                  height: DETECTION_RADIUS * 2,
                  borderRadius: DETECTION_RADIUS,
                },
              ]}
            />
          ))}
        </Animated.View>
      </GestureDetector>

      {/* Instructions */}
      <View style={styles.instructionContainer}>
        <Animated.View style={[styles.trackingIndicator, trackingLineStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: GRID_WIDTH,
    height: GRID_WIDTH,
    position: 'relative',
  },
  dot: {
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
  dotSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    transform: [{ scale: 1.2 }],
  },
  dotInner: {
    width: DOT_SIZE * 0.4,
    height: DOT_SIZE * 0.4,
    borderRadius: DOT_SIZE * 0.2,
    backgroundColor: colors.primary,
  },
  line: {
    position: 'absolute',
    height: 6,
    backgroundColor: colors.primary,
    transformOrigin: 'left center',
    borderRadius: 3,
  },
  debugZone: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  instructionContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  trackingIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});

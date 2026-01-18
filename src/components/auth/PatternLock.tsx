import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { colors } from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_SIZE = 3;
const DOT_SIZE = 28;
const GRID_PADDING = 60;
// Very large touch padding - covers most of the screen so finger can go anywhere
const TOUCH_PADDING = 100;
const GRID_WIDTH = SCREEN_WIDTH - GRID_PADDING * 2;
const CELL_SIZE = GRID_WIDTH / GRID_SIZE;
// Make touch area fill most of available space
const TOUCH_AREA_WIDTH = SCREEN_WIDTH;
const TOUCH_AREA_HEIGHT = SCREEN_HEIGHT * 0.6;

interface Point {
  row: number;
  col: number;
  x: number;
  y: number;
}

interface PatternLockProps {
  onPatternComplete: (pattern: number[]) => void;
  disabled?: boolean;
}

export default function PatternLock({ onPatternComplete, disabled = false }: PatternLockProps) {
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<View>(null);
  const layoutRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate offsets to center the grid in the large touch area
  const gridOffsetX = (TOUCH_AREA_WIDTH - GRID_WIDTH) / 2;
  const gridOffsetY = (TOUCH_AREA_HEIGHT - GRID_WIDTH) / 2;

  // Points are centered in the touch area
  const points: Point[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      points.push({
        row,
        col,
        x: gridOffsetX + col * CELL_SIZE + CELL_SIZE / 2,
        y: gridOffsetY + row * CELL_SIZE + CELL_SIZE / 2,
      });
    }
  }

  const getPointIndex = (row: number, col: number): number => {
    return row * GRID_SIZE + col;
  };

  const findNearestPoint = (x: number, y: number): Point | null => {
    // Very large threshold for thick fingers - 85% of cell size
    const threshold = CELL_SIZE * 0.85;
    let nearestPoint: Point | null = null;
    let nearestDistance = Infinity;

    for (const point of points) {
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      if (distance < threshold && distance < nearestDistance) {
        nearestDistance = distance;
        nearestPoint = point;
      }
    }
    return nearestPoint;
  };

  const isPointSelected = (point: Point): boolean => {
    return selectedPoints.some((p) => p.row === point.row && p.col === point.col);
  };

  const handleTouchStart = (event: GestureResponderEvent) => {
    if (disabled) return;

    const { locationX, locationY } = event.nativeEvent;
    const point = findNearestPoint(locationX, locationY);

    if (point && !isPointSelected(point)) {
      setSelectedPoints([point]);
      setCurrentPoint({ x: locationX, y: locationY });
    }
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    if (disabled || selectedPoints.length === 0) return;

    const { locationX, locationY } = event.nativeEvent;
    setCurrentPoint({ x: locationX, y: locationY });

    const point = findNearestPoint(locationX, locationY);
    if (point && !isPointSelected(point)) {
      setSelectedPoints((prev) => [...prev, point]);
    }
  };

  const handleTouchEnd = () => {
    if (disabled) return;

    if (selectedPoints.length >= 4) {
      const pattern = selectedPoints.map((p) => getPointIndex(p.row, p.col));
      onPatternComplete(pattern);
    }

    setSelectedPoints([]);
    setCurrentPoint(null);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: handleTouchStart,
    onPanResponderMove: handleTouchMove,
    onPanResponderRelease: handleTouchEnd,
    onPanResponderTerminate: handleTouchEnd,
    // Prevent other views from stealing the gesture
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
  });

  const renderLines = () => {
    if (selectedPoints.length < 2) return null;

    const lines = [];
    for (let i = 1; i < selectedPoints.length; i++) {
      const prev = selectedPoints[i - 1];
      const curr = selectedPoints[i];
      lines.push(
        <View
          key={`line-${i}`}
          style={[
            styles.line,
            {
              left: Math.min(prev.x, curr.x),
              top: Math.min(prev.y, curr.y) - 2,
              width: Math.sqrt(
                Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
              ),
              transform: [
                { translateX: prev.x < curr.x ? 0 : -Math.abs(curr.x - prev.x) },
                {
                  rotate: `${Math.atan2(curr.y - prev.y, curr.x - prev.x)}rad`,
                },
              ],
            },
          ]}
        />
      );
    }

    // Line to current touch point
    if (currentPoint && selectedPoints.length > 0) {
      const last = selectedPoints[selectedPoints.length - 1];
      lines.push(
        <View
          key="current-line"
          style={[
            styles.line,
            styles.currentLine,
            {
              left: last.x,
              top: last.y - 2,
              width: Math.sqrt(
                Math.pow(currentPoint.x - last.x, 2) + Math.pow(currentPoint.y - last.y, 2)
              ),
              transform: [
                {
                  rotate: `${Math.atan2(currentPoint.y - last.y, currentPoint.x - last.x)}rad`,
                },
              ],
            },
          ]}
        />
      );
    }

    return lines;
  };

  return (
    <View
      ref={containerRef}
      style={styles.container}
      {...panResponder.panHandlers}
    >
      {renderLines()}
      {points.map((point) => {
        const isSelected = isPointSelected(point);
        return (
          <View
            key={`${point.row}-${point.col}`}
            style={[
              styles.dot,
              {
                left: point.x - DOT_SIZE / 2,
                top: point.y - DOT_SIZE / 2,
              },
              isSelected && styles.dotSelected,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TOUCH_AREA_WIDTH,
    height: TOUCH_AREA_HEIGHT,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.border,
    borderWidth: 3,
    borderColor: colors.borderLight,
  },
  dotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
    transform: [{ scale: 1.3 }],
  },
  line: {
    position: 'absolute',
    height: 6,
    backgroundColor: colors.primary,
    transformOrigin: 'left center',
    borderRadius: 3,
  },
  currentLine: {
    opacity: 0.5,
  },
});

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, Animated, Keyboard } from 'react-native';
import { HourBlockComponent } from './HourBlockComponent';
import { HourBlock, DayOfWeek } from '../types';
import { isWeekend } from '../utils/dateUtils';
import { getQuoteForDate } from '../utils/quotes';

interface DailyColumnProps {
  dayName: DayOfWeek;
  date: string;
  hours: HourBlock[];
  onUpdateHour: (hour: number, content: string) => void;
  selectedHours: number[];
  onHourLongPress: (hour: number) => void;
  onHourPress: (hour: number) => void;
  width: number;
  onFocus: () => void;
  onBlur: () => void;
  sleepingHours?: { start: number; end: number } | null;
}

export const DailyColumn: React.FC<DailyColumnProps> = ({
  dayName,
  date,
  hours,
  onUpdateHour,
  selectedHours,
  onHourLongPress,
  onHourPress,
  width,
  onFocus,
  onBlur,
  sleepingHours,
}) => {
  const isWeekendDay = isWeekend(dayName);
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedWidth = useRef(new Animated.Value(width)).current;

  // Extract day number from date (e.g., "2024-01-15" -> "15")
  const dayNumber = date.split('-')[2];

  // State for current time indicator position
  const [timePosition, setTimePosition] = useState(0);

  // Quote based on the date (deterministic - same date = same quote)
  const quote = useMemo(() => getQuoteForDate(date), [date]);

  // Function to scroll to a specific hour block
  const scrollToHour = (hour: number) => {
    const HOUR_BLOCK_HEIGHT = 50;
    const scrollPosition = hour * HOUR_BLOCK_HEIGHT;
    // Offset by 150px to center the block and account for keyboard
    const adjustedPosition = Math.max(0, scrollPosition - 150);

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: adjustedPosition,
        animated: true
      });
    }, 100);
  };

  // Animate width changes
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: width,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [width]);

  // Check if this column represents today
  const isToday = () => {
    const today = new Date();
    const columnDate = new Date(date);
    return today.toDateString() === columnDate.toDateString();
  };

  // Update time indicator position
  useEffect(() => {
    const updateTimePosition = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const position = (currentHour + currentMinute / 60) * 50; // 50px per hour
      setTimePosition(position);
      return position;
    };

    const initialPosition = updateTimePosition();

    // Auto-scroll to current time on mount if this is today
    if (isToday()) {
      setTimeout(() => {
        // Scroll to center the current time, offsetting by ~200px to show context
        const scrollPosition = Math.max(0, initialPosition - 200);
        scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: true });
      }, 500);
    }

    const interval = setInterval(updateTimePosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        isWeekendDay && styles.weekendContainer,
        { width: animatedWidth },
      ]}
    >
      <View style={[styles.header, isWeekendDay && styles.weekendHeader]}>
        <Text style={styles.headerText}>{dayName}</Text>
        <Text style={styles.dateText}>{dayNumber}</Text>
      </View>
      <View style={styles.scrollContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {hours.map((hourBlock) => (
            <HourBlockComponent
              key={hourBlock.hour}
              hour={hourBlock.hour}
              content={hourBlock.content}
              onUpdate={(content) => onUpdateHour(hourBlock.hour, content)}
              isSelected={selectedHours.includes(hourBlock.hour)}
              onLongPress={() => onHourLongPress(hourBlock.hour)}
              onPress={() => onHourPress(hourBlock.hour)}
              onFocus={() => {
                onFocus();
                scrollToHour(hourBlock.hour);
              }}
              onBlur={onBlur}
              sleepingHours={sleepingHours}
            />
          ))}
          {isToday() && (
            <View style={[styles.timeIndicatorInline, { marginTop: timePosition - 1 }]} pointerEvents="none" />
          )}
          {/* Motivational quote section for keyboard avoidance */}
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  weekendContainer: {
    borderRightWidth: 2,
    borderRightColor: '#F48FB1',
    borderLeftWidth: 2,
    borderLeftColor: '#F48FB1',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderBottomWidth: 2,
    borderBottomColor: '#1976D2',
  },
  weekendHeader: {
    backgroundColor: '#F06292',
    borderBottomColor: '#EC407A',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0, // Reset default padding
  },
  quoteContainer: {
    minHeight: 400, // Extra space to allow bottom blocks to scroll above keyboard
    paddingVertical: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  quoteText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#555',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    fontWeight: '600',
  },
  timeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ff0000',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  timeIndicatorInline: {
    width: '100%',
    height: 3,
    backgroundColor: '#ff0000',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
});

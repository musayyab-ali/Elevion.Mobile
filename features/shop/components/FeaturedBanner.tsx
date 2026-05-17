import React, { useRef, useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../../constants/Theme";

interface FeaturedBannerProps {
  data: any[];
  onPress: (item: any) => void;
  variant?: "home" | "minimal";
}

export const FeaturedBanner = ({
  data,
  onPress,
  variant = "home",
}: FeaturedBannerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width: windowWidth } = useWindowDimensions();
  const isMinimal = variant === "minimal";

  // Responsive layout constraints across devices
  const maxContainerWidth = windowWidth > 768 ? 720 : windowWidth;
  const itemWidth = isMinimal ? maxContainerWidth - 32 : maxContainerWidth;

  useEffect(() => {
    if (data.length <= 1) return;

    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= data.length) nextIndex = 0;

      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 3000); // 4-second delay for premium readability profiles

    return () => clearInterval(interval);
  }, [activeIndex, data.length]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / itemWidth);
    if (index !== activeIndex && index >= 0 && index < data.length) {
      setActiveIndex(index);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const title = item.ProductName || item.Name;
    const image = item.ThumbnailImagePath || item.ImagePath;

    return (
      <TouchableOpacity
        style={[
          styles.bannerCard,
          { width: itemWidth },
          isMinimal && styles.minimalCard,
        ]}
        onPress={() => onPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri:
                image ||
                "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEg8TExAVFRUVFRcWFhYVFxUWFRYVFxUWFhUVFRcYHSggGBolHRcVITEhJSktLi4uFx8zODMtNygtLisBCgoKDg0OGg8QGy0gHyUtLTcxMzAtKzcrNysvNzA3Mi8rKy03Ny8tLy0rKy43ListKzcrKy0wLS0tLSstNys3Lf/AABEIAJ8BPgMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAAAgMFAQQGBwj/xABGEAACAQIDBAYHAwoFAwUAAAABAgADEQQSIQUGMUETIlFhcaEHMlKBkbHBFELRIzNTYnJzgpKy8BUWJKLhQ+LxFyVjk9L/xAAaAQEBAQADAQAAAAAAAAAAAAAAAQIDBAUG/8QALhEBAQACAQMCAgkFAQAAAAAAAAECEQMEITESUQWhBhNBYYGRsdHwcbLB4fEi/9oADAMBAAIRAxEAPwDmYQhOVkQhCAQhAQARgICMBAAIwEAIwEAAjAQAjAQMARgJkCMBIMATNowEYCAlpm0e0zaBHaFpJaFoEdpi0ltMWgR2ikSUiYIgRERSJKRFIgRERSJKRFIgRERSJKREIlCERTHIimAsJkzEAhCEAhCEAhCEAhCEAhCEAmRATIgZAjAQEYCBkCMBACMBIMgRgIARwIGAI4EAI4EDAEYCZAjAQFAmbRwJm0CO0LSS0LQI7TFpLaYtAiIikSYiKRAhIikSYiIRAiIiESYiIRAiIiESUiIRAjIikSQiIZQhixzFMDEIQgEIQgEIQgEIQgEJgmIcQg4uo/iECURhIaGJRyQrqxHGxBmwIGRHAmaNFnNlUsbXsoJNu3TlJ0wVU8KTnwVvwgQgSQCWeF3exL69HlHa5t5cfKJtLZFbDnrr1T6rrqjeB5eBsZNjRAkgERnCgliABqSdAB3zRfb2GX75Pgp+ZgWYEcCUqby0CwXK4B+8Qth3nW8uqNRXF1YEdxvAcCMBMgTTqbVoKxQ1NRx0Y+YEsxuXibZuUx83TcAjWlbV29h1+8W7gp+tpNgNq0q17XW1vWsOPDnN/VZ63qs/W4e8bloWkloWnE5EdpgiK9Ul1pUk6Sq18tMFVuVRnILNopyq1r8ZVbS21VwzBKuBrIxvYXQ3sQDYqTfVl+Ii2Q0tSIpEp/8AHa3RpWOEy0n9VmrUwW1t1U9Y/CWOC2hTrAZW19k6MPdz90bNJSIhEnyk6AXJ4DmT2SwOwK40YKpsDZjqLi+oF7SilIiES8G79U/fT4n8JsVNz8R0edCrnjkGjW5EX0PPTj4xs05giIRJ61NlJVgVI4gggjxBlbtLaK0VJtmItoD29p5QNgiKRKX/ADHfhRP83/bDCbYqVGJKqtMDXiTfkAefwjcNLcxTMpUDcDAyhDCZMxAIQhAIQhAJq1cfTHA3Pd+MmrmynvlNUo2mbVkZ2jVNVLdhvblwP4zRCjJbJ1s181+C29W17cbnhLWhgs9DE1s9uhNIWt6xqswAvfS2Un3SpqmYU2BRy6rTDM7MAoUEszcgAOM9N3d3Hx9SxxOSkvZcPV94XqjxufCQegnZQqYnFYhluKNIIpPAPVJuR3hUI8H757GQV0IuPMRsVeyNhUMNTZKa2zAZnOrMRqMx7O4WEr9u7GrVEC08T0XWBZlGZio4qNRYnt5S8xeJyNQQC/SuV4+qBSqOW79VA/ikWKU2MCgwtBqNNaYqO9r9aoczm5J1PYL2HcBOZ27vxRo5kpDpmGhvpSFhax9v3ad86Tb1XosPiHvYhCB4t1R5meNNTGvZ4QM4zaTVi2ewDAjKgyqt+wStou9LPYjrKVPHVTxno+6Xo9XGUKdepUqAVGYKKajQKxUszNpxDaW5S/b0S7O6i/acUxcEgq9C1ltdvzfDrAc+MXv5Hh4EucDhK9Mghindz8COE3sbsalh9pV8PTZnp0H9Z8pYlUUm+UAaObcOAm9U4z0ui6PHlxuefh5XX9dlw5Tjw86RVa9VxZm07rC/jaadbC5jfn2/8TdnV7H3Xp1qNGqTUJfNcLkAFnZbm+ttJ2us6rpug4ply9sbdfjq39JXn8GPP1XJZj3uvk89OyS2e7mzAAWWxXjqCT2E+XZLPCUAi5fC5Nrm3M2noo3OwgBJaoCq5mAZbgWJ10PYefKVm8m7VHDUFqo9Qksos5XgQTrYDXSeX0X0g+HcvPOPi9Xqyuu8urf+O31XQ9XOPeetYz7nJttNqFtb9inX/wASw3ewuN2pUKoehoqfylRRw/UUn1nPda3E8geZro1autJfWZ1pLf2mYKPMj4z6F2TsmnhKNKhTFlQW72PFmPeTcnxl6vl9fLdTUeh0fFcOKbu6oX3LoDDJQps1Nqb9KlZfzoq2sajG/WuCQRwtoLWFud2n6OcXi2pnEbQptkzAMMPZrMLNcBwNQJs4/wBITK2JyfZwKVSogFRmDv0bMoIA01K87cRKej6S9oFqoOHw46NDUZWFVGCAqLatx66Dhrcds6ztOv2F6P8AAYVbGmazFSmarY2UggqigWQWJGmuvGckvorqCrUzVwtHOejygtUKcRmJ0UjhfW9rzs9xN5am0qVWo9FaQSp0YysWzHKrHiBb1l7Z1SgEeGh8YHO7v7v0cIoCAsw+/UJd/ieHgLCTbX2cKuYj7y5WB8LG3ulni6q0ldzeygk2FzpyA5nunN196FOoweMI/ckeRMCm2BubRwLq4qVGZaZp2OQKVJU3ayi56ij3SberfBMECAueqQCFvYAcAWP0HlGp70U6lVKZw+Jps7ZR0lEqt/Emeb7z4jpcTXP65HuByr5AQNfbm92LxZOdwF5KoAAHZf1j7zKVax15g8bx69K0uNg7vpiELPiFpC/VGVqjtx1CpwsR94jly1gUHSlQ4U2DCzAcwDcXiJVInVYndCiub/3DUAHXCVQCDzuKhsPHznP7W2aKBAGJpVr/AKMVlYftrURbe4mQQpjGHCw+M3MLtV7i5vKi0yrAEay7HZ8geRFxFhs9s9AHmp8jofO0DOSMiEISghCEDWxzdW3ifpK6hV6RDf1lJB+YI7vwMscbSLDTly+N/nKrYuBqDpywK3IsDzsWJPnOO+Vddui4TCYwZ6lGpnzpVQXJNOkwyqoYM5VXqkge2vZG9INGtRw2HpVqlepUz5qj1BW6LNkvlpu9II/E6ox4G4N7zb3X2eKmDrsQ2ZWxASqFQphbYZXZ6jE3UVNEFua34yXf7ZWIrYelY0y1DMhSlYCplUZ2RABldbN+TF+qLg3uJw8lxw75b1v+b+75e7Ulvh1PoXwPQ7OFQjWvVqVD+yCKS+61O/8AFO6ote44zj/R9vPs6rhMLQp11V6VFKZp1SEclVAZhc2cE3N1vx5cJ09HE0xUprnW7lgBmFzZS2g58DOVFFvHjKNLFYUVatMZkdEps6qzu709QGI9nKD2sZr7PXpsQ7hCtKnnWmQFVGIOR2NnzMb3tdQoA5mxku82wmrVncVStOrTpU8SuRWLU6VV3To3LDoyS7g6HSxFiLzV3ZWgK+KqLiOlLlgMy0AV6+pvTpqdT2k8BfWcedmPe+8ax3fCv9INfLhWHa6D/cPwnlFKv+UakdLgsp5EDiviLn3T0f0l1b0KdvvNm96g6fGeVY/EWrUiObC3vOVh7wfKcjL6WwGz+j2XSpK7IVwqnMtgQ4TOT2ate453MpfRNRdsF09RrmpUqZRoFpp0jMyoo0UFy7fyjgoAucdWd9kO9L12wV18Wo8u/WG4uy/suFNIEkLiMQBfjlWu6L5KIHhGAqmrisfXN+s9Q/8A2VGcjykG1McaJHMFhqOQJ1j7Lx9Cl0lNnyv0jk5tAesQtjw4Ae+8pt5K3Gx0tp7za09vhznH0s9N7+Xg8nHly9ZfVO3h1FQCwI4T1HdBbYPD/sk/F2M8owxLUaTDminyE9R3OZjgsPflnHwqNPnPpzLl8P47PHrn9uTtfR+a6nPH7r+sUmJpMu0Vo5yUcWa9szUz12R2tdhdSLnW2l5c7+C+FB7Ki/Jpof4e74/pjfq1SoGtgiUFIN+8uB8ZL6RXK4K//wAg8kqH6TxLzzP4h8P1ZbMMbde/fd+Xyej9TZ0/US/blZP6fY8hwu0TQr0MRa5p1UqlfayMHsO82tPpTF41Rh6ldTcLSaqD2gIXB+E+YK/C3dPcNl4otu+Gve2z3S/7FJqf0n0bbyvdqkBi8KKlNaoqVUpsH1/OsENTmCylswuCLjhOn9KrU6dZaNJbM9Om1d/vOELLRQ8haxY6anJ7IlTuaiHGUHqGy0g9Zu21Gm1QWHbdQfAGTekbGirjHYC2WnSU+JQOfhnt7pB6V6MsF0OzcN2vnqnvzuxX/blHunVsQG8ePeORlNufRZMDgBz+zUbjv6NSfnN7bdUUKNSs2qojMQPWIAvYXlFD6THqJgn6NmW7oGdWKFFvqdNTfRbfrX5TzbZu7orUWqjH0wF6zmzsyjtOlz4989B3m2tTrbLw2IqISlboHKBgrnMMxCngSOPZZTynBJtKrnxFalQVMOopJUpEi702JUZx969/WA0zDjaBBuVVFHHhftYdDTqZRTLlKjWzWZSoy2VWa59m19ZzW1nIJe9jx7jz1nb4RsJi8Z/psM9MpSqXrMfvOMgDKtxexcgk30M1drejnG1Bam9HQffZ1JHaLIYHGU6orU1ceBHYw4ztdytnGrSQDCrW6zXU1WpZlB1NwwudbW4aCc6+wquEpLRcqXDNcrcrxB4kAnjO/wBzsNtBsEaVKqBRNN2OhHrM2ZVYAm98ykDsN7SVY3sfsvA4ijTfDYCnXdgBUX7QyPRtcrc9IeNmtbTSeQbxYVqNdqbI6Ff+m7FigOtgx9Ya8RpPWegxWz/s7YWhimdqWQjo8y5r6kCxCLoDY8NNdTfyre3F4nEYlmriqKoGU9N61lZh1QAAFvewGnGBVVkCoW1lbh2JPGbm0GOQKZuYTYzvSoMoGoYm5txY28pUXm7ZJpVAfZuO/UH6f3ebRiYWhkA11HZ29skM5IyxCEJQQhCAQ7fCEOR8JL4IutmFBs+qWJVenJfo+hNV6d8OjleksVCdIFve35bXtmhvNXZMIrLXd6i7RcvUJT899mpF2pFCRkLMxHcbESqobWxFC4p1CoLZrWVhmta9mBANvkOyS7Xxr1tnKXYM4xzcAqnL9mSxsoHO+vceydf0d/u9m9qLG4kVnaoUVS1iwUWUtYZmA5Zjdrd8vvRNQVdq4ZrAZSwFhzZGX5EzmaBnX+iilm2jT7iD/Krt9JvHGSSRLd93tO2a9q2GSz9a7ZlpM6kJmdlZh1UJsoGbjmNtZUYTZqU8Vg6XWYDBYsEsLFr1sEb27uHiJdbYwld3ptSqU0IGudGfgGtazL7WvhK+jSqJjsItRkY/Y8WbohQfnsHyLHnc8Zj0XevMu97/AJ4a3+bUoUCOkovZhqVvrdGAIzDtBzCVe8W7mDFEVRhaIdTqwpqD48JfbSGRqVQe0yH43Eg3kOXB4r9VGI+Bt9JvGamkt3dvMdpb14uphKWGNTLSphVUJdSQtsuYg9a1gfdJd2d+8ZgVfKRV6Q5iKzVHCtmZmZRmFixYknmZzWONgqxG5DulRU7QOZmbtLHTtuTNLErmUGbz65h3zTHMQO82UtsPh/3Sf0iXeF3prUKAooFABaz2uwzNm0vp5SmwJ/I0f3af0ia9Y9Yz6Lm6Xh6jgww5sZlJq6vjcfKYc3Jx82eWF1bb+qyp7exKsGFdr3Y30Or2zXuNeA+E3t9d6RisIKYplTnVic172VgRawtxnOjjNTaxKgDle4+BH1nR634f0upz/VyZYb1Z28/08/i73R9RzXknH6rq+d9/Corme27kYA1tithgQpelVVWIuAa4NQE9oBqGeHKrN1QNToPE6AT6N3KpZMMyjgHyjwCIJ5b3VLsr0b0aVOqKtV2qVKb08yWUIrgqSgIPWym3WuO6U2++4lZ36TCI1TpM7OrPTAQ9XKEzEGx63M2sJ6lVkQhT7LodHRoIRqtNFI71UA/KaO+5/wBBi/3NT+gy3toDKne5c2ExK9tN/wCkyo5vGdHT2TgOkoCoKfRWDZrIUDBW08Mv8XOcPit5KFerX6TZVJ84zOekcObc8/3Rw4CewbGoKcJh1ZQQaamxAI1F+B8ZA+z6CvfoKVyDrkS/ykHEbCbZ32l6WEQKWppnNMWp3W+XU2zHrnrWPeZ2uEfMi353Hg44ysx+zqVJ1qJSROFyqqunDkOU3VU3e3Bx0qftAWdfO8DzrflctYjvJ8lmcHvl0GCp0UqGmyX9VmUm7Fier3k98Tf97179ouPfacFjm1PYPnA7DZO/uIoWrNialWzG9B61VQbggNchhlBN9PZ4Tmd5tvtj8R07jr5cpIvbKCSoAOulzqSSb8tBKpuBJ4Af+Jq0TzgNtDgJ1uzfzNH92v8ASJyOI1X3zrdm/maP7C/ITWKVOYpjGKZtGIQhAIQhAIVPUY+7+/KEMabU0Hbc+dvpM5eCKetzldiTN+s0rqxuZholM6z0f0IYbPjsQ3sUb+9myjyLTzcT1/0EYWw2hW7TRpj+EVGP9a/CB6nU9YnsEhbCIaiViOulN6YN9MtRqbMLeNNJO40hygUu1KOalXA4izjxAv8ASc7vVir7PqH21Rfi6g+V51rnr25MLf38Z5/vc/R4SpTP3ayr7tWHygeZYo3ceMVjqe4QY6kxb+tAq3aznxmtW0MnxXrGQVxpfugd5htKdL9hP6RNeoes02cQ2WwHID5TSZuM+q16cZj7Pkcf/WVy9zX1mrts6U/A/SbAM0NrMer4fWdLrstcFnvp3+gx3zy+22N28P0mKoDkGzn+AZvmAPfPoTdRLYZT7TMfPL9J4buJS/K1H7Fyj36kf7R8Z71sNMuHoD9TN/N1vrPFyxskvv8A7/Z7mOcytk+z9pf8tyoYl4OYgMw5G/hjdfCVu8Y/IVgeaN8jN3BPxEh2pTzAJ2sB7idfKVEtCnkp019lVX4KBNXFDUeB+U3ahmnipBolg6a620PgdDI9n3Gakx6yHMh7R/yJq08RkqEH1TcTaUZitvXpm4/WTmPhA819ItTLiCo+6ot3ZiW8rzz+oLm3LnOy9I+Lz4utbSxC/BRx85x/CBrYs8F7dTNZm/vwk1ZtSZqgwJ6SFyAOZAHidJ2dOmFVVHAAD4C043C1LPTPY6nzE7QzWKUpimZMUzaCEIQCEIQCau0qnAdgE2pqYvDsxuLTORFXUE03EtXw7+yfdrK84ap+jf8AlP4TDTWM9w9B9K2Brt7WKb4LRoj53njA2fWP/Tb5fOetejjePDYHArRrdIKnSVHYKoI6xAXW/YBLoeo1OEjLWBnN/wDqFgfZrfyL/wDqId+cEwIvUFweKdvgY1RcYo6qew2PvtacJ6T6RVVI4O6n+JVcfXyl7/m3BkG7tc/qNx5HhOY352qmMpUVpG5VyzXBHKwtfxMaHm1c2I95+Uxy8ZsYzZtcsMtMkdtxw+Mats6tlFqbEyaFFjBrI8OgZlU/eYD4kCWmJ2PiCRai3DsjYHYGJzKTRIswOpUcDftlk790vjsu8U+pmszSzq7NqHWw8Li8hOyqnsnyP1n0d5+PLxlPzfNTg5MZq438mgrTQ2q+o8Pxl+uzH9g/D/ma2K3brVWvfKO+34zp9bfVxyY2Xv7x3ehnp5LcpZ29q2t0UyKn612+I08rT3eiuREXsVV+AAnjeydmmk9MsRkUrcDiVBGnZwE9H/zfQPGlU/2n6zqdXcL6Jhd6mnb6KZy53Oa3drtmiq0pxvThT92oPcv0aZG8eE9px4qfpedPTvbXlB7GbVbih/vgZQUN4cJ+mt2XV/gerwm7/j2ENv8AUJp3kfMQN9jNPGHSCbTw7erXpnwdfleYxVRSOII8RIKPE076xaFV1KsurDlfj2iFTEIt81VB2XYD5zVqbQoAg9OnuNyPCxgeV714jpMViWta9V7eGY2lE7S52rg6r1KjZSczMdNeJJlc2Aq/o2/lMCprmRASyrbOq3/NP/KZAdnVv0T/AMpgaqnUeM7lToPCcf8A4bXuPyT+9SPnOtoXyJfjlF/lNYpTGKYxizaCEIQCEIQCEIQCAhCAwjiIIwgSCMDIxHBgSgxwZEDHBkEoMkBkIMcGBMDHBkIMcGBMDGBkIMcGBKDM3kQMa8gkvC8jvC8CS8wTEvMEwGJiEzBMUmUZJkZtMkxCYGDEJmSYhMDBMQmZJiEwFMQxiYhlGDEMyYpgYMxAwgEIQgEIQgEIQgEIQgZEYRIwgOIwMjEcGBIDHBkQMcGQSgxwZCDHBgSgxwZCDHBgSgxgZEDGBgSgzN5FeZvAkvC8S8LwHvMXiXmLwHJikxSYpMBiYhMwTFJgBMUmBMQmAExCYExSYGCYpMCYplGDFMyYpgEIQgEIQgEIQgf/2Q==",
            }}
            style={[styles.bannerImage, isMinimal && styles.minimalImage]}
          />
          <LinearGradient
            colors={["transparent", "rgba(15, 23, 42, 0.85)"]}
            style={[styles.bannerGradient, isMinimal && styles.minimalGradient]}
          >
            <View style={styles.textContainer}>
              <Text style={styles.bannerText} numberOfLines={2}>
                {title}
              </Text>
              {!isMinimal && (
                <Text style={styles.actionSubtitle}>Explore Collection</Text>
              )}
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.featuredWrapper,
        isMinimal && styles.minimalWrapper,
        { width: maxContainerWidth, alignSelf: "center" },
      ]}
    >
      {isMinimal && <Text style={styles.minimalHeading}>New Arrivals</Text>}

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled={!isMinimal}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) =>
          (item.ProductId || item.CategoryId || index).toString()
        }
        onMomentumScrollEnd={handleScroll}
      />

      {/* Premium Minimal Carousel Indicator Dots */}
      {data.length > 1 && (
        <View
          style={[
            styles.indicatorContainer,
            isMinimal && styles.minimalIndicators,
          ]}
        >
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                activeIndex === index ? styles.activeDot : styles.inactiveDot,
                isMinimal &&
                  (activeIndex === index
                    ? styles.activeDotMinimal
                    : styles.inactiveDotMinimal),
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  featuredWrapper: {
    paddingTop: 10,
    paddingBottom: 24,
    backgroundColor: Colors.headerOne[0],
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
  },
  minimalWrapper: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  minimalHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    paddingHorizontal: 16,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  bannerCard: {
    paddingHorizontal: 16,
    height: 175,
  },
  minimalCard: {
    paddingHorizontal: 16,
    height: 190,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    // Modern shadow profiles
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  minimalImage: {
    borderRadius: 16,
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 20,
  },
  minimalGradient: {
    borderRadius: 16,
  },
  textContainer: {
    maxWidth: "85%",
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionSubtitle: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
  },
  minimalIndicators: {
    position: "relative",
    bottom: 0,
    marginTop: 12,
  },
  indicatorDot: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 16,
    backgroundColor: "#FFFFFF",
  },
  inactiveDot: {
    width: 5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  activeDotMinimal: {
    backgroundColor: Colors.headerOne[0],
    width: 16,
  },
  inactiveDotMinimal: {
    backgroundColor: "#CBD5E1",
    width: 5,
  },
});

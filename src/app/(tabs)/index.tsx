import { useScrollToTop } from "@react-navigation/native";
import { Link } from "expo-router";
import { memo, useRef } from "react";
import { FlatList, Text, View } from "react-native";
import type { Show } from "@/api/types";
import Loading from "@/components/Loading";
import ShowListItem, { ITEM_HEIGHT } from "@/components/ShowListItem";
import { useShows } from "@/hooks/useShows";

interface IProps {
  show: Show;
}

function ShowLink(props: IProps) {
  const { show } = props;

  return (
    <Link href={{ pathname: "/shows/[id]", params: { id: show.id } }}>
      <ShowListItem show={show} />
    </Link>
  );
}

const MemoizedShowLink = memo(ShowLink);

// Stable across renders of `List` so FlatList doesn't treat a new `data`
// reference (e.g. a page arriving) as a reason to re-render mounted cells.
function renderShow({ item }: { item: Show }) {
  return <MemoizedShowLink show={item} />;
}

function getItemLayout(
  _data: ArrayLike<Show> | null | undefined,
  index: number,
) {
  return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index };
}

export default function List() {
  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  const { data: shows, fetchNextPage, isFetchingNextPage, status } = useShows();

  return (
    <View style={{ flex: 1 }}>
      {status === "pending" && <Loading text="Loading..." />}

      {status === "error" && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, color: "red" }}>
            Failed to load shows.
          </Text>
        </View>
      )}

      {status === "success" && (
        <FlatList
          ref={listRef}
          data={shows}
          keyExtractor={(show) => show.id.toString()}
          renderItem={renderShow}
          getItemLayout={getItemLayout}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews
          onEndReached={() => fetchNextPage()}
          ListFooterComponent={() =>
            isFetchingNextPage && <Loading text="Loading more..." />
          }
        />
      )}
    </View>
  );
}

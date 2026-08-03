import { useScrollToTop } from "@react-navigation/native";
import { Link } from "expo-router";
import { memo, useRef } from "react";
import { FlatList } from "react-native";
import type { Show } from "@/api/types";
import FooterError from "@/components/FooterError";
import Loading from "@/components/Loading";
import ShowListItem, { ITEM_HEIGHT } from "@/components/ShowListItem";

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

interface ShowListProps {
  shows: Show[] | undefined;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  shouldFetchNextPage?: boolean;
  isNextPageError?: boolean;
}

export default function ShowList(props: ShowListProps) {
  const {
    shows,
    fetchNextPage,
    isFetchingNextPage = false,
    shouldFetchNextPage = false,
    isNextPageError = false,
  } = props;

  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  return (
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
      onEndReached={() => {
        if (shouldFetchNextPage) {
          fetchNextPage?.();
        }
      }}
      ListFooterComponent={() => {
        if (isFetchingNextPage) return <Loading text="Loading more..." />;
        if (isNextPageError)
          return <FooterError onRetry={() => fetchNextPage?.()} />;
        return null;
      }}
    />
  );
}

"use client";
import { BarList, Bold, Flex, Text, Title } from "@tremor/react";
import { ScrollArea } from "../ui/scroll-area";

export default function StatsBar({
  data,
  Label,
  Color,
}: Readonly<{ data: any; Label: string; Color: string | null }>) {
  return (
    <div className="p-4">
      <Title>Arrival Insights</Title>
      <Flex className="mt-4">
        <Text>
          <Bold>Destinations</Bold>
        </Text>
        <Text>
          <Bold>{Label}</Bold>
        </Text>
      </Flex>
      {!data && (
        <Flex justifyContent="center" className="h-12">
          <Text>Choose a departure station!</Text>
        </Flex>
      )}
      {data && (
        <ScrollArea className="mt-2 h-60 w-full py-0 pr-3">
          <BarList data={data} className="mt-2" color={Color} />
        </ScrollArea>
      )}
    </div>
  );
}

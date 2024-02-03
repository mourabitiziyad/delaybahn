"use client";
import { BarList, Bold, Card, Flex, Text, Title } from "@tremor/react";

export default function StatsBar({ data }) {
  // sort data by number of trips
  return (
    <Card className="max-w-lg">
      <Title>Website Analytics</Title>
      <Flex className="mt-4">
        <Text>
          <Bold>Destinations</Bold>
        </Text>
        <Text>
          <Bold>Number of Trips</Bold>
        </Text>
      </Flex>
      <BarList data={data.sort((a: { avgDelay: number; }, b: { avgDelay: number; }) => b.avgDelay - a.avgDelay)} className="mt-2" />
    </Card>
  );
}

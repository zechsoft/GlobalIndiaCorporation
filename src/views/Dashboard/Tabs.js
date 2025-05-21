import React from "react";
import { Tabs, TabList, Tab } from "@chakra-ui/react";

const TabsComponent = ({ tabs }) => {
  return (
    <Tabs defaultIndex={0} className="w-full md:w-max" isLazy>
      <TabList>
        {tabs.map(({ label, value }) => (
          <Tab key={value} value={value}>{label}</Tab>
        ))}
      </TabList>
    </Tabs>
  );
};

export default TabsComponent;
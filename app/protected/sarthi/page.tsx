"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import SchoolVisitReport from "./school-visits/report/page";

export default function SarthiPage() {
  const [activeTab, setActiveTab] = useState<'visits' | 'compliance' | 'hackathons'>('visits');

  return (
    <div className="flex flex-col items-center w-screen min-h-screen bg-gray-500">
      <div className="w-full max-w-7xl mt-20">
        <div className="flex gap-4 mb-4">
          <Button
            variant={activeTab === 'visits' ? 'default' : 'outline'}
            onClick={() => setActiveTab('visits')}
            className="min-w-[120px]"
          >
            Visits
          </Button>
          {/* <Button
            variant={activeTab === 'compliance' ? 'default' : 'outline'}
            onClick={() => setActiveTab('compliance')}
            className="min-w-[120px]"
          >
            Compliance
          </Button>
          <Button
            variant={activeTab === 'hackathons' ? 'default' : 'outline'}
            onClick={() => setActiveTab('hackathons')}
            className="min-w-[120px]"
          >
            Hackathons
          </Button> */}
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          {activeTab === 'visits' && <SchoolVisitReport />}
        </div>
      </div>
    </div>
  );
}

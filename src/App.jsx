import React from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import StatusBar from './components/StatusBar';
import EntryPointSelector from './components/EntryPointSelector';
import PlanVisualization from './components/PlanVisualization';
import Breadcrumbs from './components/Breadcrumbs';
import MarkdownStream from './components/MarkdownStream';
import Footer from './components/Footer';
import { useWalkthrough } from './hooks/useWalkthrough';

export default function App() {
  const {
    repos,
    selectedRepo,
    expandedRepos,
    walkthroughState,
    planData,
    activePlan,
    selectedEntryPoint,
    currentStep,
    markdownContent,
    isStreaming,
    contentRef,
    toggleRepo,
    selectRepo,
    handleStartWalkthrough,
    handleNext,
    handleEntryPointChange
  } = useWalkthrough();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          repos={repos}
          selectedRepo={selectedRepo}
          expandedRepos={expandedRepos}
          toggleRepo={toggleRepo}
          selectRepo={selectRepo}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedRepo ? `Repo: ${selectedRepo.split('/').pop()}` : 'Select a repository'}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleStartWalkthrough}
                disabled={!selectedRepo || walkthroughState === 'loading'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                <span>▶</span>
                Start
              </button>
              <button
                onClick={handleNext}
                disabled={walkthroughState !== 'ready' || isStreaming || currentStep >= (activePlan?.sequence?.length || 0)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                Next
                <span>→</span>
              </button>
            </div>
          </div>

          <StatusBar
            walkthroughState={walkthroughState}
            currentStep={currentStep}
            totalSteps={activePlan?.sequence?.length || 0}
          />

          {planData && planData.entry_points?.length > 1 && (
            <EntryPointSelector
              entryPoints={planData.entry_points}
              selectedIndex={selectedEntryPoint}
              onSelect={handleEntryPointChange}
            />
          )}

          {activePlan && (
            <PlanVisualization
              plan={activePlan}
              currentStep={currentStep}
            />
          )}

          {activePlan && currentStep > 0 && (
            <Breadcrumbs
              sequence={activePlan.sequence}
              currentStep={currentStep}
            />
          )}

          <MarkdownStream
            content={markdownContent}
            walkthroughState={walkthroughState}
            contentRef={contentRef}
          />

          <Footer />
        </div>
      </div>
    </div>
  );
}
export interface TestSettings {
    /**
     * Default timeout for navigation events in ms
     *
     * @default 60000
     */
    timeout?: number;

    /**
     * Duration in milliseconds the page has to stay idle when checking for page idleness
     *
     * @default 2000
     */
    settleTime?: number;

    /**
     * Debug mode prints more information on what is going on
     *
     * @default false
     */
    debugMode?: boolean;

    /**
     * If performance mode is enabled, &perf=true is added into the Dynamics URL, for showing the MS performance overlay on all pages
     */
    performanceMode?: boolean;
}
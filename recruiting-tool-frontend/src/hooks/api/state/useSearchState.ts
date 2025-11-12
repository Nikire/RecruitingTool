import {atom, useAtomValue, useSetAtom} from 'jotai';

export interface SearchState {
	page: number;
	limit: number;
	search: string;
}

const defaultSearchState: SearchState = {
	page: 1,
	limit: 10,
	search: '',
};

// In-memory search states for each page (resets on page refresh)
export const candidatesSearchAtom = atom<SearchState>(defaultSearchState);
export const companiesSearchAtom = atom<SearchState>(defaultSearchState);
export const hiringProcessesSearchAtom = atom<SearchState>(defaultSearchState);
export const jobPositionsSearchAtom = atom<SearchState>(defaultSearchState);

// Read-only hooks (subscribe to changes) - use these for data that needs to trigger re-renders
export const useCandidatesSearchValue = () => useAtomValue(candidatesSearchAtom);
export const useCompaniesSearchValue = () => useAtomValue(companiesSearchAtom);
export const useHiringProcessesSearchValue = () => useAtomValue(hiringProcessesSearchAtom);
export const useJobPositionsSearchValue = () => useAtomValue(jobPositionsSearchAtom);

// Write-only hooks (don't subscribe) - use these for callbacks that update state
export const useCandidatesSearchSetter = () => useSetAtom(candidatesSearchAtom);
export const useCompaniesSearchSetter = () => useSetAtom(companiesSearchAtom);
export const useHiringProcessesSearchSetter = () => useSetAtom(hiringProcessesSearchAtom);
export const useJobPositionsSearchSetter = () => useSetAtom(jobPositionsSearchAtom);

// Legacy hooks (for backward compatibility if needed, but prefer split hooks)
export const useCandidatesSearch = () => [useAtomValue(candidatesSearchAtom), useSetAtom(candidatesSearchAtom)] as const;
export const useCompaniesSearch = () => [useAtomValue(companiesSearchAtom), useSetAtom(companiesSearchAtom)] as const;
export const useHiringProcessesSearch = () => [useAtomValue(hiringProcessesSearchAtom), useSetAtom(hiringProcessesSearchAtom)] as const;
export const useJobPositionsSearch = () => [useAtomValue(jobPositionsSearchAtom), useSetAtom(jobPositionsSearchAtom)] as const;

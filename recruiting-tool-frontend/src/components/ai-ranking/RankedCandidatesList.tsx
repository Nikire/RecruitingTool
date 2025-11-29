/**
 * RankedCandidatesList Component
 *
 * Displays a sortable, filterable list/table of candidates ranked by AI score.
 * Includes filtering by score range and expandable details.
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  TextField,
  MenuItem,
  Slider,
  Avatar,
  Button,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  PersonOutline as PersonIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { CandidateScore, getScoreTierColor, ScoreTier } from '../../types/ai-ranking';
import ScoreBreakdown from './ScoreBreakdown';

interface RankedCandidatesListProps {
  candidates: CandidateScore[];
  onViewProfile?: (candidateUid: string) => void;
  isLoading?: boolean;
}

type SortField = 'rank' | 'name' | 'score';
type SortDirection = 'asc' | 'desc';

/**
 * Get initials from candidate name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const RankedCandidatesList: React.FC<RankedCandidatesListProps> = ({
  candidates,
  onViewProfile,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  // State
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<ScoreTier | 'all'>('all');
  const [scoreRange, setScoreRange] = useState<number[]>([0, 100]);

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort candidates
  const filteredAndSortedCandidates = React.useMemo(() => {
    let filtered = candidates.filter((candidate) => {
      // Tier filter
      if (tierFilter !== 'all' && candidate.scoreTier !== tierFilter) {
        return false;
      }

      // Score range filter
      if (candidate.overallScore < scoreRange[0] || candidate.overallScore > scoreRange[1]) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.candidateName.localeCompare(b.candidateName);
          break;
        case 'score':
          comparison = a.overallScore - b.overallScore;
          break;
        case 'rank':
        default:
          comparison = b.overallScore - a.overallScore; // Rank by score
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [candidates, sortField, sortDirection, tierFilter, scoreRange]);

  // Toggle row expansion
  const handleToggleExpand = (candidateUid: string) => {
    setExpandedRow(expandedRow === candidateUid ? null : candidateUid);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          {t('common.loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          {t('common.filter')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Tier Filter */}
          <TextField
            select
            label={t('ai_ranking.filter_by_tier')}
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as ScoreTier | 'all')}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">{t('ai_ranking.all_tiers')}</MenuItem>
            <MenuItem value="excellent">{t('ai_ranking.excellent')}</MenuItem>
            <MenuItem value="good">{t('ai_ranking.good')}</MenuItem>
            <MenuItem value="fair">{t('ai_ranking.fair')}</MenuItem>
            <MenuItem value="poor">{t('ai_ranking.poor')}</MenuItem>
          </TextField>

          {/* Score Range Filter */}
          <Box sx={{ minWidth: 250 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {t('ai_ranking.score_range')}: {scoreRange[0]} - {scoreRange[1]}
            </Typography>
            <Slider
              value={scoreRange}
              onChange={(_, newValue) => setScoreRange(newValue as number[])}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              size="small"
            />
          </Box>

          {/* Results Count */}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {t('ai_ranking.showing_candidates', { count: filteredAndSortedCandidates.length })}
          </Typography>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }} />
              <TableCell>
                <TableSortLabel
                  active={sortField === 'rank'}
                  direction={sortField === 'rank' ? sortDirection : 'desc'}
                  onClick={() => handleSort('rank')}
                >
                  {t('ai_ranking.rank')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  {t('candidates.name_label')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'score'}
                  direction={sortField === 'score' ? sortDirection : 'desc'}
                  onClick={() => handleSort('score')}
                >
                  {t('ai_ranking.overall_score')}
                </TableSortLabel>
              </TableCell>
              <TableCell>{t('ai_ranking.tier')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('ai_ranking.no_scores')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedCandidates.map((candidate, index) => {
                const isExpanded = expandedRow === candidate.candidateUid;
                const tierColor = getScoreTierColor(candidate.scoreTier);

                return (
                  <React.Fragment key={candidate.candidateUid}>
                    {/* Main Row */}
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleExpand(candidate.candidateUid)}
                          aria-label={isExpanded ? t('aria.close') : t('aria.view')}
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          #{index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: `${tierColor}.main`,
                              fontSize: 14,
                            }}
                          >
                            {getInitials(candidate.candidateName)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {candidate.candidateName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {candidate.candidateEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ minWidth: 120 }}>
                          <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {candidate.overallScore}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={candidate.overallScore}
                            sx={{
                              height: 6,
                              borderRadius: 1,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: `${tierColor}.main`,
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`ai_ranking.${candidate.scoreTier}`)}
                          color={tierColor}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PersonIcon />}
                          onClick={() => onViewProfile?.(candidate.candidateUid)}
                        >
                          {t('ai_ranking.view_profile')}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row - Score Breakdown */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 0, borderBottom: isExpanded ? 1 : 0 }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 3, px: 2 }}>
                            <ScoreBreakdown
                              breakdown={candidate.breakdown}
                              showExplanations={false}
                            />
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RankedCandidatesList;

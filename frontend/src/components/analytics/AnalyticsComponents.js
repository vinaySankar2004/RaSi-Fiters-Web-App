import React from "react";
import {
    Box,
    Typography,
    Paper,
    Tooltip,
    IconButton,
    alpha
} from "@mui/material";
import { Info, ArrowUpward, ArrowDownward } from '@mui/icons-material';

/**
 * Reusable Stat Card Component
 */
export const StatCard = ({
                             title,
                             value,
                             subtitle,
                             icon,
                             trend,
                             color = '#ffb800',
                             bgColor = 'rgba(255,184,0,0.15)'
                         }) => {
    const trendIcon = trend > 0 ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
    const trendColor = trend > 0 ? '#4caf50' : '#ff5252';

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                background: 'rgba(30,30,30,0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }
            }}
        >
            <Box sx={{ p: 3, position: 'relative' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 45,
                        height: 45,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: bgColor,
                        borderRadius: '12px',
                        color: color
                    }}
                >
                    {icon}
                </Box>

                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {title}
                </Typography>

                <Typography variant="h4" sx={{ fontWeight: 700, color: color, my: 1 }}>
                    {value}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {trend !== undefined && (
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: trendColor,
                                mr: 1,
                                backgroundColor: alpha(trendColor, 0.1),
                                px: 1,
                                py: 0.3,
                                borderRadius: '4px'
                            }}
                        >
                            {trendIcon}
                            {Math.abs(trend)}%
                        </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

/**
 * Reusable Chart Card Component
 */
export const ChartCard = ({
                              title,
                              chart,
                              height = 300,
                              info,
                              actions,
                              minHeight,
                              maxHeight
                          }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(30,30,30,0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden'
            }}
        >
            <Box sx={{
                px: 3,
                pt: 2,
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {title}
                    </Typography>
                    {info && (
                        <Tooltip title={info}>
                            <IconButton size="small" sx={{ ml: 0.5, color: 'text.secondary' }}>
                                <Info fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                {actions}
            </Box>

            <Box sx={{
                p: 2,
                flexGrow: 1,
                height,
                minHeight: minHeight || height,
                maxHeight: maxHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {chart}
            </Box>
        </Paper>
    );
};

/**
 * Reusable Progress Card Component
 */
export const ProgressCard = ({
                                 title,
                                 value,
                                 max,
                                 percentage,
                                 color = '#ffb800',
                                 subtitle,
                                 icon
                             }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                background: 'rgba(30,30,30,0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }
            }}
        >
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {icon && (
                        <Box
                            sx={{
                                mr: 2,
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: alpha(color, 0.15),
                                borderRadius: '10px',
                                color: color
                            }}
                        >
                            {icon}
                        </Box>
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                </Box>

                <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        {value} / {max} ({percentage}%)
                    </Typography>
                    <Box sx={{ width: '100%', height: '8px', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                        <Box
                            sx={{
                                width: `${percentage}%`,
                                height: '100%',
                                bgcolor: color,
                                borderRadius: '4px',
                                transition: 'width 1s ease-in-out'
                            }}
                        />
                    </Box>
                </Box>

                {subtitle && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

/**
 * Reusable RadialProgress Component
 */
export const RadialProgressOld = ({
                                   value,
                                   maxValue,
                                   size = 120,
                                   strokeWidth = 8,
                                   color = '#ffb800',
                                   label,
                                   labelSize = '2rem',
                                   subtitle
                               }) => {
    const percentage = Math.min(100, Math.round((value / maxValue) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <Box sx={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
            </svg>

            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 700, color: color, fontSize: labelSize }}
                >
                    {percentage}%
                </Typography>

                {label && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {label}
                    </Typography>
                )}

                {subtitle && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textAlign: 'center', px: 1 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

/**
 * Reusable RadialProgress Component
 */
export const RadialProgress = ({
                                   value,
                                   maxValue,
                                   size = 120,
                                   strokeWidth = 8,
                                   color = '#ffb800',
                                   label,
                                   labelSize = '2rem',
                                   subtitle
                               }) => {
    // const percentage = Math.min(100, Math.round((value / maxValue) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - circumference;

    return (
        <Box sx={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
            </svg>

            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 700, color: color, fontSize: labelSize }}
                >
                    {`${value}`}
                </Typography>

                {label && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {label}
                    </Typography>
                )}

                {subtitle && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textAlign: 'center', px: 1 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

/**
 * Loading Placeholder Component
 */
export const LoadingPlaceholder = ({ height = 300 }) => {
    return (
        <Box
            sx={{
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: '16px'
            }}
        >
            <Typography variant="body2" color="text.secondary">
                Loading data...
            </Typography>
        </Box>
    );
};

import './Skeleton.css';

interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table-row';
    width?: string | number;
    height?: string | number;
    count?: number;
    className?: string;
}

export function Skeleton({
    variant = 'rectangular',
    width,
    height,
    count = 1,
    className = ''
}: SkeletonProps) {
    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    const skeletons = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`skeleton skeleton-${variant} ${className}`}
            style={style}
        />
    ));

    return <>{skeletons}</>;
}

// Pre-built skeleton patterns for common use cases
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="skeleton-table">
            {/* Header */}
            <div className="skeleton-table-header">
                <Skeleton variant="text" width="15%" height={20} />
                <Skeleton variant="text" width="25%" height={20} />
                <Skeleton variant="text" width="20%" height={20} />
                <Skeleton variant="text" width="15%" height={20} />
                <Skeleton variant="text" width="10%" height={20} />
            </div>
            {/* Rows */}
            {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="skeleton-table-row">
                    <Skeleton variant="text" width="15%" height={16} />
                    <Skeleton variant="text" width="25%" height={16} />
                    <Skeleton variant="text" width="20%" height={16} />
                    <Skeleton variant="text" width="15%" height={16} />
                    <Skeleton variant="circular" width={32} height={32} />
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-card-header">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="skeleton-card-title">
                    <Skeleton variant="text" width="60%" height={18} />
                    <Skeleton variant="text" width="40%" height={14} />
                </div>
            </div>
            <Skeleton variant="text" width="100%" height={14} />
            <Skeleton variant="text" width="80%" height={14} />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="skeleton-dashboard">
            {/* Welcome header */}
            <div className="skeleton-welcome">
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="text" width="60%" height={18} />
            </div>

            {/* Stats grid */}
            <div className="skeleton-stats-grid">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton-stat-card">
                        <Skeleton variant="circular" width={48} height={48} />
                        <div>
                            <Skeleton variant="text" width={60} height={28} />
                            <Skeleton variant="text" width={100} height={14} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

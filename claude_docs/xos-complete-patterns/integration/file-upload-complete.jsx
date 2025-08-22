// XOS File Upload Complete Patterns
// Comprehensive React components for file upload with progress, validation, and error handling

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Utils } from '../utils/utils-ajax-complete';

// ============================================================================
// BASIC FILE UPLOAD PATTERNS
// ============================================================================

// ✅ CORRECT: Basic file upload component
const BasicFileUpload = ({ onUploadComplete, onError, acceptedTypes = '*', maxSize = 10485760 }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        // Validate file type
        if (acceptedTypes !== '*') {
            const typeArray = acceptedTypes.split(',').map(type => type.trim());
            const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
            const mimeType = selectedFile.type;
            
            const isValidType = typeArray.some(type => 
                type === fileExtension || 
                type === mimeType || 
                (type.endsWith('/*') && mimeType.startsWith(type.slice(0, -1)))
            );

            if (!isValidType) {
                onError && onError('Invalid file type. Accepted types: ' + acceptedTypes);
                return;
            }
        }

        // Validate file size
        if (selectedFile.size > maxSize) {
            onError && onError(`File size exceeds ${formatFileSize(maxSize)} limit`);
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await Utils.ajax({
                url: '/api/files/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                xhr: function() {
                    const xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const percentComplete = (e.loaded / e.total) * 100;
                            setProgress(Math.round(percentComplete));
                        }
                    });
                    return xhr;
                }
            });

            if (response.success) {
                onUploadComplete && onUploadComplete(response.data);
                setFile(null);
                setProgress(0);
                fileInputRef.current.value = '';
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error) {
            onError && onError(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="file-upload-basic">
            <div className="mb-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control"
                    onChange={handleFileSelect}
                    accept={acceptedTypes}
                    disabled={uploading}
                />
            </div>

            {file && (
                <div className="file-info mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{file.name}</strong>
                            <div className="text-muted small">{formatFileSize(file.size)}</div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>

                    {uploading && (
                        <div className="progress mt-2">
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                                {progress}%
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ❌ WRONG: No validation or error handling
const BadFileUpload = () => {
    const [file, setFile] = useState(null);

    const handleUpload = async () => {
        // No validation, no error handling, no progress indication
        const formData = new FormData();
        formData.append('file', file);
        
        await fetch('/api/files/upload', {
            method: 'POST',
            body: formData
        });
    };

    return (
        <div>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

// ============================================================================
// ADVANCED FILE UPLOAD PATTERNS
// ============================================================================

// ✅ CORRECT: Drag and drop file upload with multiple files
const DragDropFileUpload = ({ 
    onUploadComplete, 
    onError, 
    acceptedTypes = '*',
    maxSize = 10485760,
    maxFiles = 5,
    multiple = true 
}) => {
    const [files, setFiles] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const validateFiles = (fileList) => {
        const validatedFiles = [];
        const errors = [];

        Array.from(fileList).forEach((file, index) => {
            // Check file count
            if (validatedFiles.length >= maxFiles) {
                errors.push(`Maximum ${maxFiles} files allowed`);
                return;
            }

            // Validate file type
            if (acceptedTypes !== '*') {
                const typeArray = acceptedTypes.split(',').map(type => type.trim());
                const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
                const mimeType = file.type;
                
                const isValidType = typeArray.some(type => 
                    type === fileExtension || 
                    type === mimeType || 
                    (type.endsWith('/*') && mimeType.startsWith(type.slice(0, -1)))
                );

                if (!isValidType) {
                    errors.push(`${file.name}: Invalid file type`);
                    return;
                }
            }

            // Validate file size
            if (file.size > maxSize) {
                errors.push(`${file.name}: File size exceeds ${formatFileSize(maxSize)} limit`);
                return;
            }

            // Check for duplicates
            const isDuplicate = validatedFiles.some(f => 
                f.name === file.name && f.size === file.size
            );

            if (isDuplicate) {
                errors.push(`${file.name}: Duplicate file`);
                return;
            }

            validatedFiles.push({
                file,
                id: Date.now() + index,
                progress: 0,
                status: 'pending', // pending, uploading, completed, error
                error: null
            });
        });

        return { validatedFiles, errors };
    };

    const handleFileSelect = (event) => {
        const { validatedFiles, errors } = validateFiles(event.target.files);
        
        if (errors.length > 0) {
            onError && onError(errors.join('\n'));
        }

        if (validatedFiles.length > 0) {
            setFiles(prev => [...prev, ...validatedFiles]);
        }

        // Clear the input
        event.target.value = '';
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);

        const { validatedFiles, errors } = validateFiles(event.dataTransfer.files);
        
        if (errors.length > 0) {
            onError && onError(errors.join('\n'));
        }

        if (validatedFiles.length > 0) {
            setFiles(prev => [...prev, ...validatedFiles]);
        }
    };

    const uploadFile = async (fileObj) => {
        const formData = new FormData();
        formData.append('file', fileObj.file);

        return new Promise((resolve, reject) => {
            Utils.ajax({
                url: '/api/files/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                xhr: function() {
                    const xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const percentComplete = (e.loaded / e.total) * 100;
                            setFiles(prev => prev.map(f => 
                                f.id === fileObj.id 
                                    ? { ...f, progress: Math.round(percentComplete) }
                                    : f
                            ));
                        }
                    });
                    return xhr;
                },
                success: (response) => {
                    if (response.success) {
                        setFiles(prev => prev.map(f => 
                            f.id === fileObj.id 
                                ? { ...f, status: 'completed', progress: 100 }
                                : f
                        ));
                        resolve(response.data);
                    } else {
                        reject(new Error(response.message || 'Upload failed'));
                    }
                },
                error: (xhr, status, error) => {
                    reject(new Error(error || 'Upload failed'));
                }
            });
        });
    };

    const handleUploadAll = async () => {
        const pendingFiles = files.filter(f => f.status === 'pending');
        if (pendingFiles.length === 0) return;

        setUploading(true);

        // Update status to uploading
        setFiles(prev => prev.map(f => 
            f.status === 'pending' ? { ...f, status: 'uploading' } : f
        ));

        const uploadPromises = pendingFiles.map(async (fileObj) => {
            try {
                const result = await uploadFile(fileObj);
                return { success: true, file: fileObj, result };
            } catch (error) {
                setFiles(prev => prev.map(f => 
                    f.id === fileObj.id 
                        ? { ...f, status: 'error', error: error.message }
                        : f
                ));
                return { success: false, file: fileObj, error: error.message };
            }
        });

        try {
            const results = await Promise.allSettled(uploadPromises);
            const successfulUploads = results
                .filter(r => r.status === 'fulfilled' && r.value.success)
                .map(r => r.value.result);

            if (successfulUploads.length > 0) {
                onUploadComplete && onUploadComplete(successfulUploads);
            }

            const failedUploads = results
                .filter(r => r.status === 'rejected' || !r.value.success)
                .length;

            if (failedUploads > 0) {
                onError && onError(`${failedUploads} files failed to upload`);
            }
        } catch (error) {
            onError && onError('Upload process failed');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const retryFile = (fileId) => {
        setFiles(prev => prev.map(f => 
            f.id === fileId 
                ? { ...f, status: 'pending', error: null, progress: 0 }
                : f
        ));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'uploading': return '⬆️';
            case 'completed': return '✅';
            case 'error': return '❌';
            default: return '';
        }
    };

    return (
        <div className="drag-drop-upload">
            <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="drop-zone-content">
                    <div className="upload-icon">📁</div>
                    <p className="drop-text">
                        Drag and drop files here or <span className="click-text">click to browse</span>
                    </p>
                    <p className="file-info">
                        {acceptedTypes !== '*' && `Accepted types: ${acceptedTypes}`}
                        <br />
                        Max size: {formatFileSize(maxSize)} per file
                        <br />
                        Max files: {maxFiles}
                    </p>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={acceptedTypes}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {files.length > 0 && (
                <div className="file-list mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>Files ({files.length})</h6>
                        <div>
                            <button
                                className="btn btn-primary btn-sm me-2"
                                onClick={handleUploadAll}
                                disabled={uploading || files.every(f => f.status !== 'pending')}
                            >
                                Upload All
                            </button>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => setFiles([])}
                                disabled={uploading}
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    {files.map((fileObj) => (
                        <div key={fileObj.id} className="file-item">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="file-details">
                                    <div className="d-flex align-items-center">
                                        <span className="status-icon me-2">
                                            {getStatusIcon(fileObj.status)}
                                        </span>
                                        <div>
                                            <div className="file-name">{fileObj.file.name}</div>
                                            <div className="file-size text-muted">
                                                {formatFileSize(fileObj.file.size)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="file-actions">
                                    {fileObj.status === 'error' && (
                                        <button
                                            className="btn btn-outline-warning btn-sm me-2"
                                            onClick={() => retryFile(fileObj.id)}
                                            disabled={uploading}
                                        >
                                            Retry
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => removeFile(fileObj.id)}
                                        disabled={uploading && fileObj.status === 'uploading'}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {fileObj.status === 'uploading' && (
                                <div className="progress mt-2">
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{ width: `${fileObj.progress}%` }}
                                        aria-valuenow={fileObj.progress}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    >
                                        {fileObj.progress}%
                                    </div>
                                </div>
                            )}

                            {fileObj.error && (
                                <div className="alert alert-danger alert-sm mt-2">
                                    {fileObj.error}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// IMAGE UPLOAD WITH PREVIEW PATTERNS
// ============================================================================

// ✅ CORRECT: Image upload with preview and cropping
const ImageUploadWithPreview = ({ 
    onUploadComplete, 
    onError,
    maxSize = 5242880, // 5MB
    allowedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    enableCropping = false,
    previewWidth = 200,
    previewHeight = 200
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [cropMode, setCropMode] = useState(false);
    const [cropData, setCropData] = useState(null);
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            validateAndPreviewImage(file);
        }
    };

    const validateAndPreviewImage = (file) => {
        // Validate file type
        if (!allowedFormats.includes(file.type)) {
            onError && onError(`Invalid file format. Allowed: ${allowedFormats.join(', ')}`);
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            onError && onError(`File size exceeds ${formatFileSize(maxSize)} limit`);
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleCrop = () => {
        if (!preview || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = previewWidth;
            canvas.height = previewHeight;

            // Simple center crop for demo - in real app, use a proper cropping library
            const aspectRatio = img.width / img.height;
            const targetAspectRatio = previewWidth / previewHeight;

            let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

            if (aspectRatio > targetAspectRatio) {
                // Image is wider than target
                sourceWidth = img.height * targetAspectRatio;
                sourceX = (img.width - sourceWidth) / 2;
            } else {
                // Image is taller than target
                sourceHeight = img.width / targetAspectRatio;
                sourceY = (img.height - sourceHeight) / 2;
            }

            ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, previewWidth, previewHeight
            );

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                const croppedFile = new File([blob], selectedFile.name, {
                    type: selectedFile.type,
                    lastModified: Date.now()
                });
                
                setCropData({
                    file: croppedFile,
                    preview: canvas.toDataURL()
                });
                setCropMode(false);
            }, selectedFile.type, 0.9);
        };

        img.src = preview;
    };

    const handleUpload = async () => {
        const fileToUpload = cropData ? cropData.file : selectedFile;
        if (!fileToUpload) return;

        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('image', fileToUpload);
            
            // Add metadata
            formData.append('originalName', selectedFile.name);
            formData.append('width', previewWidth.toString());
            formData.append('height', previewHeight.toString());

            const response = await Utils.ajax({
                url: '/api/files/upload-image',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                xhr: function() {
                    const xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const percentComplete = (e.loaded / e.total) * 100;
                            setProgress(Math.round(percentComplete));
                        }
                    });
                    return xhr;
                }
            });

            if (response.success) {
                onUploadComplete && onUploadComplete(response.data);
                resetComponent();
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error) {
            onError && onError(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const resetComponent = () => {
        setSelectedFile(null);
        setPreview(null);
        setCropData(null);
        setCropMode(false);
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="image-upload-preview">
            {!selectedFile && (
                <div className="upload-area">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={allowedFormats.join(',')}
                        onChange={handleFileSelect}
                        className="form-control"
                        disabled={uploading}
                    />
                    <div className="upload-hints mt-2">
                        <small className="text-muted">
                            Supported formats: {allowedFormats.map(f => f.split('/')[1]).join(', ')}
                            <br />
                            Max size: {formatFileSize(maxSize)}
                        </small>
                    </div>
                </div>
            )}

            {selectedFile && preview && (
                <div className="preview-area">
                    <div className="row">
                        <div className="col-md-6">
                            <h6>Original Image</h6>
                            <div className="image-preview">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                                />
                            </div>
                            <div className="image-info mt-2">
                                <small className="text-muted">
                                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                </small>
                            </div>
                        </div>

                        {enableCropping && (
                            <div className="col-md-6">
                                <h6>Cropped Preview ({previewWidth}x{previewHeight})</h6>
                                <canvas
                                    ref={canvasRef}
                                    style={{ 
                                        border: '1px solid #ddd',
                                        maxWidth: '100%'
                                    }}
                                />
                                {cropData && (
                                    <div className="crop-info mt-2">
                                        <small className="text-success">
                                            ✓ Cropped and ready for upload
                                        </small>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="upload-actions mt-3">
                        {enableCropping && !cropData && (
                            <button
                                className="btn btn-outline-secondary me-2"
                                onClick={handleCrop}
                                disabled={uploading}
                            >
                                Crop Image
                            </button>
                        )}

                        <button
                            className="btn btn-primary me-2"
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload Image'}
                        </button>

                        <button
                            className="btn btn-outline-secondary"
                            onClick={resetComponent}
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                    </div>

                    {uploading && (
                        <div className="progress mt-3">
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                                {progress}%
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// CHUNKED UPLOAD PATTERNS
// ============================================================================

// ✅ CORRECT: Large file upload with chunking and resume capability
const ChunkedFileUpload = ({ 
    onUploadComplete, 
    onError,
    chunkSize = 1048576, // 1MB chunks
    maxRetries = 3
}) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadId, setUploadId] = useState(null);
    const [uploadedChunks, setUploadedChunks] = useState(new Set());
    const [currentChunk, setCurrentChunk] = useState(0);
    const [paused, setPaused] = useState(false);
    const abortControllerRef = useRef(null);

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            resetUploadState();
        }
    };

    const resetUploadState = () => {
        setUploading(false);
        setProgress(0);
        setUploadId(null);
        setUploadedChunks(new Set());
        setCurrentChunk(0);
        setPaused(false);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const initializeUpload = async () => {
        try {
            const response = await Utils.ajax({
                url: '/api/files/initialize-chunked-upload',
                type: 'POST',
                data: JSON.stringify({
                    fileName: file.name,
                    fileSize: file.size,
                    chunkSize: chunkSize,
                    totalChunks: Math.ceil(file.size / chunkSize)
                }),
                contentType: 'application/json',
                dataType: 'json'
            });

            if (response.success) {
                setUploadId(response.data.uploadId);
                // If resuming, get already uploaded chunks
                if (response.data.uploadedChunks) {
                    setUploadedChunks(new Set(response.data.uploadedChunks));
                }
                return response.data.uploadId;
            } else {
                throw new Error(response.message || 'Failed to initialize upload');
            }
        } catch (error) {
            throw new Error('Failed to initialize upload: ' + error.message);
        }
    };

    const uploadChunk = async (chunkIndex, retryCount = 0) => {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('uploadId', uploadId);

        try {
            abortControllerRef.current = new AbortController();

            const response = await Utils.ajax({
                url: '/api/files/upload-chunk',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                signal: abortControllerRef.current.signal
            });

            if (response.success) {
                setUploadedChunks(prev => new Set([...prev, chunkIndex]));
                return true;
            } else {
                throw new Error(response.message || 'Chunk upload failed');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                throw error; // Don't retry aborted requests
            }

            if (retryCount < maxRetries) {
                console.log(`Retrying chunk ${chunkIndex}, attempt ${retryCount + 1}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
                return uploadChunk(chunkIndex, retryCount + 1);
            } else {
                throw new Error(`Failed to upload chunk ${chunkIndex} after ${maxRetries} retries: ${error.message}`);
            }
        }
    };

    const finalizeUpload = async () => {
        try {
            const response = await Utils.ajax({
                url: '/api/files/finalize-chunked-upload',
                type: 'POST',
                data: JSON.stringify({
                    uploadId: uploadId,
                    fileName: file.name,
                    fileSize: file.size
                }),
                contentType: 'application/json',
                dataType: 'json'
            });

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to finalize upload');
            }
        } catch (error) {
            throw new Error('Failed to finalize upload: ' + error.message);
        }
    };

    const startUpload = async () => {
        if (!file) return;

        setUploading(true);
        setPaused(false);

        try {
            // Initialize upload if not already done
            let currentUploadId = uploadId;
            if (!currentUploadId) {
                currentUploadId = await initializeUpload();
            }

            const totalChunks = Math.ceil(file.size / chunkSize);
            
            // Upload chunks sequentially (or implement parallel upload with concurrency limit)
            for (let i = 0; i < totalChunks; i++) {
                if (paused) {
                    break;
                }

                // Skip already uploaded chunks
                if (uploadedChunks.has(i)) {
                    continue;
                }

                setCurrentChunk(i);
                await uploadChunk(i);

                // Update progress
                const completedChunks = uploadedChunks.size + 1;
                const progressPercent = Math.round((completedChunks / totalChunks) * 100);
                setProgress(progressPercent);
            }

            if (!paused && uploadedChunks.size === totalChunks - 1) {
                // All chunks uploaded, finalize
                const result = await finalizeUpload();
                onUploadComplete && onUploadComplete(result);
                resetUploadState();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                onError && onError(error.message || 'Upload failed');
            }
            setUploading(false);
        }
    };

    const pauseUpload = () => {
        setPaused(true);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setUploading(false);
    };

    const resumeUpload = () => {
        if (file && uploadId) {
            startUpload();
        }
    };

    const cancelUpload = async () => {
        setPaused(true);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (uploadId) {
            try {
                await Utils.ajax({
                    url: '/api/files/cancel-chunked-upload',
                    type: 'POST',
                    data: JSON.stringify({ uploadId }),
                    contentType: 'application/json'
                });
            } catch (error) {
                console.error('Failed to cancel upload:', error);
            }
        }

        resetUploadState();
        setFile(null);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const totalChunks = file ? Math.ceil(file.size / chunkSize) : 0;

    return (
        <div className="chunked-file-upload">
            {!file && (
                <div className="upload-area">
                    <input
                        type="file"
                        onChange={handleFileSelect}
                        className="form-control"
                    />
                    <div className="upload-info mt-2">
                        <small className="text-muted">
                            Large files will be uploaded in {formatFileSize(chunkSize)} chunks with resume capability
                        </small>
                    </div>
                </div>
            )}

            {file && (
                <div className="file-upload-area">
                    <div className="file-info mb-3">
                        <h6>{file.name}</h6>
                        <div className="text-muted">
                            Size: {formatFileSize(file.size)} | 
                            Chunks: {totalChunks} × {formatFileSize(chunkSize)}
                        </div>
                    </div>

                    <div className="upload-controls mb-3">
                        {!uploading && !paused && (
                            <button
                                className="btn btn-primary me-2"
                                onClick={startUpload}
                            >
                                Start Upload
                            </button>
                        )}

                        {uploading && (
                            <button
                                className="btn btn-warning me-2"
                                onClick={pauseUpload}
                            >
                                Pause
                            </button>
                        )}

                        {paused && uploadedChunks.size > 0 && (
                            <button
                                className="btn btn-success me-2"
                                onClick={resumeUpload}
                            >
                                Resume
                            </button>
                        )}

                        <button
                            className="btn btn-outline-secondary"
                            onClick={cancelUpload}
                        >
                            Cancel
                        </button>
                    </div>

                    {(uploading || paused || uploadedChunks.size > 0) && (
                        <div className="upload-progress">
                            <div className="progress mb-2">
                                <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{ width: `${progress}%` }}
                                    aria-valuenow={progress}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >
                                    {progress}%
                                </div>
                            </div>

                            <div className="progress-details">
                                <small className="text-muted">
                                    Chunks: {uploadedChunks.size}/{totalChunks} completed
                                    {uploading && ` | Current: ${currentChunk + 1}`}
                                    {paused && ' | Paused'}
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// COMPLETE EXAMPLE
// ============================================================================

// ✅ COMPLETE EXAMPLE: Full-featured file upload system
const FileUploadSystem = () => {
    const [uploads, setUploads] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type = 'info') => {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        setNotifications(prev => [...prev, notification]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
    };

    const handleUploadComplete = (uploadData, type) => {
        const upload = {
            id: Date.now(),
            ...uploadData,
            type,
            timestamp: new Date()
        };
        setUploads(prev => [...prev, upload]);
        addNotification(`${type} upload completed successfully`, 'success');
    };

    const handleUploadError = (error, type) => {
        addNotification(`${type} upload failed: ${error}`, 'error');
    };

    const removeUpload = (uploadId) => {
        setUploads(prev => prev.filter(u => u.id !== uploadId));
    };

    return (
        <div className="file-upload-system">
            <div className="container">
                <h2>File Upload System</h2>

                {/* Notifications */}
                {notifications.length > 0 && (
                    <div className="notifications">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`alert alert-${notification.type === 'error' ? 'danger' : notification.type === 'success' ? 'success' : 'info'} alert-dismissible`}
                            >
                                {notification.message}
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="row">
                    {/* Basic Upload */}
                    <div className="col-md-6 mb-4">
                        <div className="card">
                            <div className="card-header">
                                <h5>Basic File Upload</h5>
                            </div>
                            <div className="card-body">
                                <BasicFileUpload
                                    onUploadComplete={(data) => handleUploadComplete(data, 'Basic')}
                                    onError={(error) => handleUploadError(error, 'Basic')}
                                    acceptedTypes=".pdf,.doc,.docx,.txt"
                                    maxSize={10485760}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Drag & Drop Upload */}
                    <div className="col-md-6 mb-4">
                        <div className="card">
                            <div className="card-header">
                                <h5>Drag & Drop Upload</h5>
                            </div>
                            <div className="card-body">
                                <DragDropFileUpload
                                    onUploadComplete={(data) => handleUploadComplete(data, 'Drag & Drop')}
                                    onError={(error) => handleUploadError(error, 'Drag & Drop')}
                                    acceptedTypes="image/*"
                                    maxSize={5242880}
                                    maxFiles={3}
                                    multiple={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload with Preview */}
                    <div className="col-md-6 mb-4">
                        <div className="card">
                            <div className="card-header">
                                <h5>Image Upload with Preview</h5>
                            </div>
                            <div className="card-body">
                                <ImageUploadWithPreview
                                    onUploadComplete={(data) => handleUploadComplete(data, 'Image')}
                                    onError={(error) => handleUploadError(error, 'Image')}
                                    enableCropping={true}
                                    previewWidth={300}
                                    previewHeight={200}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Chunked Upload */}
                    <div className="col-md-6 mb-4">
                        <div className="card">
                            <div className="card-header">
                                <h5>Large File Upload (Chunked)</h5>
                            </div>
                            <div className="card-body">
                                <ChunkedFileUpload
                                    onUploadComplete={(data) => handleUploadComplete(data, 'Chunked')}
                                    onError={(error) => handleUploadError(error, 'Chunked')}
                                    chunkSize={1048576}
                                    maxRetries={3}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload History */}
                {uploads.length > 0 && (
                    <div className="upload-history mt-4">
                        <h4>Upload History</h4>
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>File Name</th>
                                        <th>Size</th>
                                        <th>Upload Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {uploads.map(upload => (
                                        <tr key={upload.id}>
                                            <td>{upload.type}</td>
                                            <td>{upload.fileName || upload.originalName}</td>
                                            <td>{upload.fileSize || 'N/A'}</td>
                                            <td>{upload.timestamp.toLocaleString()}</td>
                                            <td>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => removeUpload(upload.id)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export {
    BasicFileUpload,
    DragDropFileUpload,
    ImageUploadWithPreview,
    ChunkedFileUpload,
    FileUploadSystem
};
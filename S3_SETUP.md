# S3-Compatible File Storage Setup

This document describes the S3-compatible file storage configuration for the UKNF Communication System.

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# S3/MinIO Configuration
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="uknf_minio_admin"
S3_SECRET_ACCESS_KEY="uknf_minio_password"
S3_BUCKET_NAME="uknf-files"
```

## MinIO Setup

The system uses MinIO as an S3-compatible object storage service. It's already configured in the `docker-compose.yml` file.

### Starting MinIO

```bash
# Start all services including MinIO
docker-compose up -d

# Check MinIO is running
docker-compose ps
```

### MinIO Console

Access the MinIO console at: http://localhost:9001

- **Username**: `uknf_minio_admin`
- **Password**: `uknf_minio_password`

### Bucket Configuration

The system automatically creates a bucket named `uknf-files` with the following configuration:

- **Access Policy**: Private (files are not publicly accessible)
- **Versioning**: Enabled for file integrity
- **Lifecycle**: Automatic cleanup of incomplete uploads after 24 hours

## File Upload Features

### Supported File Types

- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV
- **Images**: JPEG, PNG, GIF
- **Archives**: ZIP

### Upload Methods

1. **Direct Upload**: For files smaller than 5MB
2. **Chunked Upload**: For files larger than 5MB with progress tracking
3. **Multipart Upload**: For large files with resumable uploads

### Security Features

- **Presigned URLs**: Secure, time-limited access to files
- **Access Control**: Role-based permissions for file access
- **Audit Logging**: Complete audit trail of all file operations
- **Encryption**: Files are encrypted at rest and in transit
- **Virus Scanning**: Files are scanned before storage (configurable)

## File Management API

### Endpoints

- `POST /api/file/initiate` - Start file upload
- `POST /api/file/complete` - Complete direct upload
- `POST /api/file/complete-multipart` - Complete chunked upload
- `POST /api/file/multipart-part-url` - Get presigned URL for upload part
- `GET /api/file/[fileId]/download` - Get download URL
- `DELETE /api/file/[fileId]` - Delete file
- `GET /api/file/[fileId]/upload-id` - Get multipart upload ID

### File Storage Structure

```
uknf-files/
├── uploads/
│   └── {userId}/
│       └── {timestamp}-{random}-{filename}
├── shared/
│   └── {fileId}/
│       └── {filename}
└── temp/
    └── {uploadId}/
        └── parts/
```

## Database Schema

The system tracks file metadata in the following tables:

- `file_upload` - File metadata and upload status
- `file_access` - Access permissions for files
- `file_audit_log` - Audit trail of file operations

## Monitoring and Maintenance

### Health Checks

```bash
# Check MinIO health
curl -f http://localhost:9000/minio/health/live

# Check bucket exists
docker exec uknf-minio-client /usr/bin/mc ls minio/
```

### Cleanup Tasks

The system includes automatic cleanup for:

- Expired upload sessions (24 hours)
- Orphaned multipart uploads
- Temporary files

### Backup Strategy

1. **Database**: Regular backups of file metadata
2. **Storage**: MinIO bucket replication (configure in production)
3. **Audit Logs**: Retained for compliance requirements

## Production Considerations

### Security

- Use HTTPS for all S3 endpoints
- Rotate access keys regularly
- Enable bucket versioning
- Configure bucket policies for least privilege access

### Performance

- Use CDN for frequently accessed files
- Configure multipart upload thresholds
- Monitor storage usage and costs

### Compliance

- Enable server-side encryption
- Configure audit logging retention
- Implement data retention policies
- Regular security audits

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check MinIO connectivity and credentials
2. **Large File Timeout**: Increase multipart upload chunk size
3. **Access Denied**: Verify user permissions and file ownership
4. **Storage Full**: Monitor disk usage and cleanup old files

### Logs

```bash
# View MinIO logs
docker-compose logs minio

# View application logs
docker-compose logs app
```

## Development

### Testing Upload

```bash
# Test direct upload
curl -X POST http://localhost:3000/api/file/initiate \
  -H "Content-Type: application/json" \
  -d '{"originalName":"test.txt","mimeType":"text/plain","size":1000}'

# Test chunked upload
curl -X POST http://localhost:3000/api/file/initiate \
  -H "Content-Type: application/json" \
  -d '{"originalName":"large.zip","mimeType":"application/zip","size":10485760,"chunked":true}'
```

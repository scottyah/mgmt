{{- define "osa-suite.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "osa-suite.labels" -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}

{{- define "osa-suite.backendName" -}}
{{ include "osa-suite.fullname" . }}-backend
{{- end -}}

{{- define "osa-suite.frontendName" -}}
{{ include "osa-suite.fullname" . }}-frontend
{{- end -}}

{{- define "osa-suite.backendImage" -}}
{{- if .Values.imageRegistry -}}
{{ .Values.imageRegistry }}/{{ .Values.backend.image }}:{{ .Values.backend.tag }}
{{- else -}}
{{ .Values.backend.image }}:{{ .Values.backend.tag }}
{{- end -}}
{{- end -}}

{{- define "osa-suite.frontendImage" -}}
{{- if .Values.imageRegistry -}}
{{ .Values.imageRegistry }}/{{ .Values.frontend.image }}:{{ .Values.frontend.tag }}
{{- else -}}
{{ .Values.frontend.image }}:{{ .Values.frontend.tag }}
{{- end -}}
{{- end -}}

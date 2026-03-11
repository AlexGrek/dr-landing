{{- define "dr-landing.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "dr-landing.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "dr-landing.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "dr-landing.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "dr-landing.selectorLabels" -}}
app.kubernetes.io/name: {{ include "dr-landing.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
